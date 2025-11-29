import type {
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	GenericValue,
	IDataObject,
	IHttpRequestMethods,
	IHttpRequestOptions,
	JsonObject,
} from 'n8n-workflow';

import { NodeApiError, NodeOperationError, sleep } from 'n8n-workflow';
import type { SharetribeApiResponseType } from '../types';

/**
 * Rate limiter for Sharetribe API with endpoint-specific rules
 */
class SharetribeRateLimiter {
	private static instance: SharetribeRateLimiter;
	private queryTokens: number = 100; // Start with full bucket
	private commandTokens: number = 100; // Start with full bucket
	private listingCreateTokens: number = 100; // Always rate limited
	private lastQueryRefill: number = Date.now();
	private lastCommandRefill: number = Date.now();
	private lastListingCreateRefill: number = Date.now();
	private activeCalls: number = 0;
	private readonly maxConcurrency: number = 10;

	static getInstance(): SharetribeRateLimiter {
		if (!SharetribeRateLimiter.instance) {
			SharetribeRateLimiter.instance = new SharetribeRateLimiter();
		}
		return SharetribeRateLimiter.instance;
	}

	private refillTokens(): void {
		const now = Date.now();

		// Query endpoints: 1 req/sec = 60 per minute
		const queryElapsed = (now - this.lastQueryRefill) / 1000;
		this.queryTokens = Math.min(100, this.queryTokens + queryElapsed);
		this.lastQueryRefill = now;

		// Command endpoints: 1 req/2sec = 30 per minute
		const commandElapsed = (now - this.lastCommandRefill) / 1000;
		this.commandTokens = Math.min(100, this.commandTokens + commandElapsed / 2);
		this.lastCommandRefill = now;

		// Listing create: 100 per minute (always enforced)
		const listingElapsed = (now - this.lastListingCreateRefill) / 60000; // minutes
		this.listingCreateTokens = Math.min(100, this.listingCreateTokens + listingElapsed * 95); // Keep below 100
		this.lastListingCreateRefill = now;
	}

	private isQueryEndpoint(method: string): boolean {
		return method === 'GET';
	}

	private isListingCreateEndpoint(endpoint: string): boolean {
		return endpoint === 'listings' || endpoint.endsWith('listings/create');
	}

	private async waitForToken(tokens: number, bucketName: string): Promise<void> {
		if (tokens >= 1) {
			return; // Token available
		}

		// Calculate wait time based on refill rate
		let waitTime: number;
		if (bucketName === 'query') {
			waitTime = 1000; // 1 second for query endpoints
		} else if (bucketName === 'command') {
			waitTime = 2000; // 2 seconds for command endpoints
		} else {
			waitTime = 630; // ~37 seconds per minute / 60 = 0.63 seconds per token for listing create
		}

		await sleep(waitTime);
	}

	private async waitForConcurrencySlot(): Promise<void> {
		while (this.activeCalls >= this.maxConcurrency) {
			await sleep(100);
		}
	}

	async acquireToken(
		method: string,
		endpoint: string,
		enableGeneralRateLimit: boolean,
	): Promise<() => void> {
		// Always wait for concurrency limit
		await this.waitForConcurrencySlot();
		this.activeCalls++;

		this.refillTokens();

		// Always rate limit listing creation
		if (this.isListingCreateEndpoint(endpoint)) {
			await this.waitForToken(this.listingCreateTokens, 'listingCreate');
			this.listingCreateTokens -= 1;
		} else if (enableGeneralRateLimit) {
			// Only apply other rate limits if enabled (dev/test environments)
			if (this.isQueryEndpoint(method)) {
				await this.waitForToken(this.queryTokens, 'query');
				this.queryTokens -= 1;
			} else {
				// Command endpoint
				await this.waitForToken(this.commandTokens, 'command');
				this.commandTokens -= 1;
			}
		}

		// Return cleanup function
		return () => {
			this.activeCalls--;
		};
	}
}

/**
 * Sharetribe API error structure
 */
interface SharetribeApiError {
	id: string;
	status: number;
	code: string;
	title: string;
	details?: string;
	source?: {
		path: string[];
		type: 'body' | 'query';
	};
}

/**
 * Handle and format Sharetribe API errors with exponential backoff for 429s
 */
export function handleSharetribeError(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	error: JsonObject,
	endpoint: string,
): never {
	// Parse Sharetribe API error responses
	const errorResponse = error as {
		response?: {
			status?: number;
			data?: {
				errors?: SharetribeApiError[];
			};
		};
		httpCode?: string;
		context?: {
			data?: {
				errors?: SharetribeApiError[];
			};
		};
		status?: number;
		message?: string;
		isRetryable?: boolean;
	};

	const statusCode =
		errorResponse.response?.status ||
		errorResponse.status ||
		(errorResponse.httpCode ? parseInt(errorResponse.httpCode) : undefined);

	// Check for errors in response.data.errors (direct from httpRequestWithAuthentication)
	// or context.data.errors (n8n wrapped format)
	const apiErrors = errorResponse.response?.data?.errors || errorResponse.context?.data?.errors;

	// Check for properly formatted Sharetribe API errors
	if (apiErrors && Array.isArray(apiErrors) && apiErrors.length > 0) {
		const primaryError = apiErrors[0];

		// Use details as the main message (the actual error), title as supplementary info
		const errorMessage = primaryError.details || primaryError.title || 'API request failed';
		let errorDescription = '';

		// Add information about the error code and status
		const errorInfo: string[] = [];
		if (primaryError.code) {
			errorInfo.push(`Code: ${primaryError.code}`);
		}
		if (primaryError.status) {
			errorInfo.push(`Status: ${primaryError.status}`);
		}
		if (primaryError.id) {
			errorInfo.push(`Error ID: ${primaryError.id}`);
		}

		if (errorInfo.length > 0) {
			errorDescription += `${errorInfo.join(' | ')}<br><br>`;
		}

		// Add source information if available (parameter validation errors)
		if (primaryError.source?.path) {
			const paramPath = primaryError.source.path.join('.');
			errorDescription += `Parameter: ${paramPath} (${primaryError.source.type})<br><br>`;
		}

		// If there are multiple errors, list them
		if (apiErrors.length > 1) {
			errorDescription += `Additional errors:`;
			for (let i = 1; i < apiErrors.length; i++) {
				const additionalError = apiErrors[i];
				if (additionalError) {
					errorDescription += `<br>• ${additionalError.title}`;
					if (additionalError.source?.path) {
						errorDescription += ` (${additionalError.source.path.join('.')})`;
					}
				}
			}
			errorDescription += `<br><br>`;
		}

		throw new NodeApiError(this.getNode(), error as JsonObject, {
			message: errorMessage,
			description: errorDescription,
			httpCode: statusCode?.toString() || 'unknown',
		});
	}

	// Fallback for non-standard errors or missing error structure
	if (statusCode) {
		const errorMessage = errorResponse.message || 'Unknown error';
		let description = `API Error (${statusCode}): ${errorMessage}`;

		// Add basic status code handling
		switch (statusCode) {
			case 401:
				description = 'Authentication failed. Please check your API credentials.';
				break;
			case 403:
				description = 'Access forbidden. Insufficient permissions.';
				break;
			case 404:
				description = `Resource not found for endpoint: ${endpoint}`;
				break;
			case 429:
				description =
					'Rate limit exceeded. The request will be automatically retried with exponential backoff.';
				errorResponse.isRetryable = true;
				break;
			case 500:
				description = 'Internal server error. Please try again later.';
				break;
			case 502:
			case 503:
			case 504:
				description = 'Service unavailable. Please try again later.';
				break;
		}

		throw new NodeApiError(this.getNode(), error as JsonObject, {
			message: 'Sharetribe API Error',
			description,
			httpCode: statusCode.toString(),
		});
	}

	// Handle non-HTTP errors
	throw new NodeOperationError(
		this.getNode(),
		`Unexpected error in Sharetribe API call to ${endpoint}: ${errorResponse.message || 'Unknown error'}`,
	);
}

/**
 * Make an API request to Sharetribe with rate limiting and exponential backoff
 *
 * @returns JSON:API formatted response from Sharetribe with typed structure
 */
export async function apiRequest<T extends IDataObject = IDataObject>(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject | GenericValue | GenericValue[] = {},
	query: IDataObject = {},
	maxRetries: number = 3,
	retryAttempt: number = 0,
): Promise<SharetribeApiResponseType<T>> {
	const credentials = await this.getCredentials('sharetribeOAuth2Api');
	const baseUrl = (credentials.baseUrl as string).replace(/\/$/, '');
	const enableRateLimit = (credentials.enableRateLimit as boolean) || false;

	// Get rate limiter instance
	const rateLimiter = SharetribeRateLimiter.getInstance();

	// Acquire token and get cleanup function
	const cleanup = await rateLimiter.acquireToken(method, endpoint, enableRateLimit);

	const options: IHttpRequestOptions = {
		method,
		body,
		qs: query,
		url: `${baseUrl}/v1/integration_api/${endpoint}`,
		headers: {
			'content-type': 'application/json; charset=utf-8',
		},
	};

	try {
		const result = await this.helpers.httpRequestWithAuthentication.call(
			this,
			'sharetribeOAuth2Api',
			options,
		);
		cleanup(); // Release concurrency slot
		return result;
	} catch (error) {
		cleanup(); // Release concurrency slot

		// Handle 429 errors with exponential backoff
		if (error.response?.status === 429 && retryAttempt < maxRetries) {
			const backoffDelay = Math.min(1000 * Math.pow(2, retryAttempt), 30000); // Max 30 seconds
			await sleep(backoffDelay);

			// Retry the request (generic type T flows through)
			return (await apiRequest.call(
				this,
				method,
				endpoint,
				body,
				query,
				maxRetries,
				retryAttempt + 1,
			)) as SharetribeApiResponseType<T>;
		}

		return handleSharetribeError.call(this, error, endpoint) as never;
	}
}
