import type {
	IDataObject,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
	INodePropertyOptions,
} from 'n8n-workflow';
import {
	makeCacheKey,
	writeStaticCache,
	setMemCache,
	getInflight,
	setInflight,
	deleteInflight,
	getMemCache,
	readStaticCache,
	clearOtherCaches,
} from './cache';

import { NormalizedListing, NormalizedUser } from '../types';

/* --------------------------------- FALLBACKS -------------------------------- */

export const FALLBACK_PROCESSES = ['default-booking', 'default-inquiry', 'default-purchase'];

export const FALLBACK_STATES = [
	'state/accepted',
	'state/cancelled',
	'state/completed',
	'state/declined',
	'state/delivered',
	'state/disputed',
	'state/expired',
	'state/free-inquiry',
	'state/inquiry',
	'state/payment-expired',
	'state/preauthorized',
	'state/pending-payment',
	'state/purchased',
	'state/received',
	'state/request-payment',
	'state/reviewed',
	'state/reviewed-by-customer',
	'state/reviewed-by-provider',
];

export const FALLBACK_TRANSITIONS = [
	'transition/accept',
	'transition/auto-cancel',
	'transition/auto-cancel-from-disputed',
	'transition/auto-complete',
	'transition/auto-mark-received',
	'transition/cancel',
	'transition/cancel-from-disputed',
	'transition/complete',
	'transition/confirm-payment',
	'transition/decline',
	'transition/dispute',
	'transition/expire',
	'transition/expire-customer-review-period',
	'transition/expire-payment',
	'transition/expire-provider-review-period',
	'transition/expire-review-period',
	'transition/inquire',
	'transition/inquire-without-payment',
	'transition/mark-delivered',
	'transition/mark-received',
	'transition/mark-received-from-disputed',
	'transition/mark-received-from-purchased',
	'transition/operator-accept',
	'transition/operator-complete',
	'transition/operator-decline',
	'transition/operator-dispute',
	'transition/operator-mark-delivered',
	'transition/request-payment',
	'transition/request-payment-after-inquiry',
	'transition/review-1-by-customer',
	'transition/review-1-by-provider',
	'transition/review-2-by-customer',
	'transition/review-2-by-provider',
];

export const FALLBACK_BOOKING_STATES = ['pending', 'proposed', 'accepted', 'declined', 'cancelled'];

/* --------------------------------- HELPERS ---------------------------------- */

export async function integrationApiRequest(
	this: ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	qs: IDataObject = {},
	body?: IDataObject,
) {
	this.logger.info(`[Sharetribe] API Request: ${method} ${endpoint}`, { qs, body });
	const credentials = await this.getCredentials('sharetribeOAuth2Api');
	const baseUrl = (credentials.baseUrl as string).replace(/\/$/, '');

	const options: IHttpRequestOptions = {
		method,
		url: `${baseUrl}/v1/integration_api/${endpoint}`,
		qs,
		json: true,
	};

	if (method !== 'GET' && body) options.body = body;

	try {
		const result = await this.helpers.httpRequestWithAuthentication.call(
			this,
			'sharetribeOAuth2Api',
			options,
		);
		this.logger.info(`[Sharetribe] API Response: ${method} ${endpoint} - Success`);
		return result;
	} catch (error) {
		this.logger.error(`[Sharetribe] API Error: ${method} ${endpoint}`, error);
		throw error;
	}
}

/* --------------------------- AUTO-POPULATE DATA ---------------------------- */

export interface DiscoveredData {
	processes: Set<string>;
	states: Set<string>;
	transitions: Set<string>;
	bookingStates: Set<string>;
	extended: {
		transaction: Record<string, string>;
		listing: Record<string, string>;
		customer: Record<string, string>;
		provider: Record<string, string>;
	};
	validated?: {
		transaction: Set<string>;
		listing: Set<string>;
		user: Set<string>;
	};
	lastTransactionTimestamp?: string; // ISO timestamp of most recent transaction learned from
	lastListingTimestamp?: string; // ISO timestamp of most recent listing learned from
	lastUserTimestamp?: string; // ISO timestamp of most recent user learned from
}

export async function readCreds(this: ILoadOptionsFunctions) {
	const credentials = await this.getCredentials('sharetribeOAuth2Api');
	const baseUrl = (credentials.baseUrl as string).replace(/\/$/, '');
	const integrationClientId = (credentials?.clientId as string) || '';
	const marketplaceClientId = (credentials?.marketplaceApiClientId as string) || '';
	const enableAutoPopulate = !!credentials?.enableDynamicLearning;

	// Read discovery configuration from fixedCollection with fallbacks to constants
	const discoverySettings = credentials?.discoverySettings as
		| { settings?: { discoveryResourceLimit?: number; discoveryCacheTTL?: number } }
		| undefined;
	const discoveryResourceLimit = discoverySettings?.settings?.discoveryResourceLimit || 10;
	const discoveryCacheTTLMinutes = discoverySettings?.settings?.discoveryCacheTTL || 5;
	const ttlSec = discoveryCacheTTLMinutes * 60; // Convert minutes to seconds

	this.logger.info('[Sharetribe] Credentials read:', {
		baseUrl,
		enableAutoPopulate,
		hasIntegrationClientId: !!integrationClientId,
		hasMarketplaceApiClientId: !!marketplaceClientId,
		discoveryResourceLimit,
		discoveryCacheTTLMinutes,
	});

	return {
		baseUrl,
		integrationClientId,
		marketplaceClientId,
		ttlSec,
		enableAutoPopulate,
		discoveryResourceLimit,
		discoveryCacheTTLMinutes,
	};
}

/**
 * Detect extended data field type from value
 *
 * Note: In Sharetribe, 'string' type extended data fields represent enum values, not arbitrary text.
 * Only enum values, numbers, and booleans can be used for filtering and sorting.
 * Arrays and objects are complex types that cannot be filtered or sorted.
 */
function typeOfValue(v: unknown): string {
	if (typeof v === 'boolean') return 'boolean';
	if (typeof v === 'number') return Number.isInteger(v) ? 'long' : 'number';
	if (typeof v === 'string') return 'string'; // String = enum value in Sharetribe
	if (Array.isArray(v)) return 'array';
	if (v && typeof v === 'object') return 'object';
	return 'string';
}

function addExtended(record: Record<string, string>, scope: string, obj: unknown) {
	if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return;
	for (const [k, v] of Object.entries(obj)) {
		const key = `${scope}.${k}`;
		const t = typeOfValue(v);
		if (!record[key]) {
			record[key] = t;
		} else {
			const prev = record[key];
			if (prev === 'string' && (t === 'long' || t === 'number' || t === 'boolean')) record[key] = t;
			if (prev === 'long' && t === 'number') record[key] = 'number';
		}
	}
}

interface ResourceObject {
	id: string;
	type: string;
	attributes?: IDataObject;
	relationships?: IDataObject;
	links?: IDataObject;
	[key: string]: unknown;
}

function normalizeItem(resource: ResourceObject, included: ResourceObject[]): IDataObject {
	if (!resource || typeof resource !== 'object') return resource as IDataObject;

	const normalized: IDataObject = {
		id: resource.id,
		type: resource.type,
	};

	// Flatten attributes to root level
	if (resource.attributes) {
		Object.assign(normalized, resource.attributes);
	}

	// Resolve relationships from included array
	if (resource.relationships) {
		for (const [key, value] of Object.entries(resource.relationships)) {
			if (value && typeof value === 'object') {
				const relData = (value as IDataObject).data;
				if (relData) {
					if (Array.isArray(relData)) {
						normalized[key] = relData
							.map((ref) => findIncluded(ref as ResourceObject, included))
							.filter((item): item is IDataObject => item !== undefined);
					} else {
						normalized[key] = findIncluded(relData as ResourceObject, included);
					}
				}
			}
		}
	}

	return normalized;
}

function findIncluded(
	reference: ResourceObject,
	included: ResourceObject[],
): IDataObject | undefined {
	if (!reference || !reference.id || !reference.type) return undefined;

	const found = included.find((item) => item.id === reference.id && item.type === reference.type);
	if (!found) return undefined;

	const normalized: IDataObject = {
		id: found.id,
		type: found.type,
	};

	if (found.attributes) {
		Object.assign(normalized, found.attributes);
	}

	return normalized;
}

async function fetchAndDiscover(
	this: ILoadOptionsFunctions,
	existingData?: DiscoveredData,
): Promise<DiscoveredData> {
	const isIncremental = !!existingData;
	this.logger.info(
		`[Sharetribe] Starting ${isIncremental ? 'incremental' : 'full'} auto-populate discovery from transactions, listings, and users`,
	);

	// Read discovery limit from credentials
	const { discoveryResourceLimit } = await readCreds.call(this);

	// Start with existing data or create new sets
	const processes = existingData ? new Set(existingData.processes) : new Set<string>();
	const states = existingData ? new Set(existingData.states) : new Set<string>();
	const transitions = existingData ? new Set(existingData.transitions) : new Set<string>();
	const bookingStates = existingData ? new Set(existingData.bookingStates) : new Set<string>();
	const extTransaction: Record<string, string> = existingData
		? { ...existingData.extended.transaction }
		: {};
	const extListing: Record<string, string> = existingData
		? { ...existingData.extended.listing }
		: {};
	const extCustomer: Record<string, string> = existingData
		? { ...existingData.extended.customer }
		: {};
	const extProvider: Record<string, string> = existingData
		? { ...existingData.extended.provider }
		: {};
	const validated = existingData?.validated
		? {
				transaction: new Set(existingData.validated.transaction),
				listing: new Set(existingData.validated.listing),
				user: new Set(existingData.validated.user),
			}
		: {
				transaction: new Set<string>(),
				listing: new Set<string>(),
				user: new Set<string>(),
			};

	// Use the same limit for all resources (from credentials)
	const transactionLimit = discoveryResourceLimit;
	const listingLimit = discoveryResourceLimit;
	const userLimit = discoveryResourceLimit;

	// Fetch from all three resources in parallel
	const [transactionTimestamp, listingTimestamp, userTimestamp] = await Promise.all([
		fetchTransactions.call(
			this,
			processes,
			states,
			transitions,
			bookingStates,
			extTransaction,
			extListing,
			extCustomer,
			extProvider,
			transactionLimit,
			existingData?.lastTransactionTimestamp,
			isIncremental,
		),
		fetchListings.call(
			this,
			extListing,
			listingLimit,
			existingData?.lastListingTimestamp,
			isIncremental,
		),
		fetchUsers.call(
			this,
			extCustomer,
			extProvider,
			userLimit,
			existingData?.lastUserTimestamp,
			isIncremental,
		),
	]);

	this.logger.info('[Sharetribe] Discovery complete:', {
		isIncremental,
		processes: processes.size,
		states: states.size,
		transitions: transitions.size,
		bookingStates: bookingStates.size,
		extendedFields:
			Object.keys(extTransaction).length +
			Object.keys(extListing).length +
			Object.keys(extCustomer).length +
			Object.keys(extProvider).length,
		lastTransactionTimestamp: transactionTimestamp,
		lastListingTimestamp: listingTimestamp,
		lastUserTimestamp: userTimestamp,
	});

	return {
		processes,
		states,
		transitions,
		bookingStates,
		extended: {
			transaction: extTransaction,
			listing: extListing,
			customer: extCustomer,
			provider: extProvider,
		},
		validated,
		lastTransactionTimestamp: transactionTimestamp,
		lastListingTimestamp: listingTimestamp,
		lastUserTimestamp: userTimestamp,
	};
}

/**
 * Fetch transactions and learn from them
 */
async function fetchTransactions(
	this: ILoadOptionsFunctions,
	processes: Set<string>,
	states: Set<string>,
	transitions: Set<string>,
	bookingStates: Set<string>,
	extTransaction: Record<string, string>,
	extListing: Record<string, string>,
	extCustomer: Record<string, string>,
	extProvider: Record<string, string>,
	fetchLimit: number,
	lastTimestamp?: string,
	isIncremental = false,
): Promise<string | undefined> {
	let page = 1,
		fetched = 0;
	const perPage = Math.min(100, fetchLimit);
	let mostRecentTimestamp: string | undefined = lastTimestamp;

	const queryParams: IDataObject = {
		page,
		per_page: perPage,
		expand: true,
		sort: 'createdAt',
		order: 'desc',
		include: ['provider', 'customer', 'listing'].join(','),
		'fields.transaction':
			'id,processName,state,transitions,lastTransition,bookingState,metadata,protectedData,createdAt',
		'fields.listing': 'id,metadata,publicData,privateData',
		'fields.user':
			'id,profile.metadata,profile.publicData,profile.privateData,profile.protectedData',
	};

	// For incremental fetch, query only new transactions
	if (isIncremental && lastTimestamp) {
		queryParams.createdAt = lastTimestamp;
		this.logger.info(`[Sharetribe] Fetching transactions created after ${lastTimestamp}`);
	}

	while (fetched < fetchLimit) {
		const resp = await integrationApiRequest.call(this, 'GET', 'transactions/query', {
			...queryParams,
			page,
		});

		const data = resp?.data ?? resp;
		const included = resp?.included || [];
		const meta = resp?.meta;

		if (!Array.isArray(data) || data.length === 0) break;

		for (const resource of data) {
			const tx = normalizeItem(resource as ResourceObject, included);

			// Track most recent transaction timestamp
			if (tx.createdAt) {
				const txTimestamp = String(tx.createdAt);
				if (!mostRecentTimestamp || txTimestamp > mostRecentTimestamp) {
					mostRecentTimestamp = txTimestamp;
				}
			}

			if (tx.processName) processes.add(String(tx.processName));
			const state = tx.state;
			if (typeof state === 'string') {
				states.add(state.startsWith('state/') ? state : `state/${state}`);
			}

			// Collect booking state if present
			if (tx.bookingState) {
				bookingStates.add(String(tx.bookingState));
			}

			const hist = Array.isArray(tx.transitions) ? tx.transitions : undefined;
			if (hist) {
				for (const h of hist) {
					const t = (h as IDataObject | undefined)?.transition;
					if (typeof t === 'string') {
						transitions.add(t.startsWith('transition/') ? t : `transition/${t}`);
					}
				}
			} else {
				const lastTransition = tx.lastTransition;
				if (typeof lastTransition === 'string') {
					transitions.add(
						lastTransition.startsWith('transition/')
							? lastTransition
							: `transition/${lastTransition}`,
					);
				}
			}

			addExtended(extTransaction, 'metadata', tx.metadata);
			addExtended(extTransaction, 'protectedData', tx.protectedData);

			const listing = tx.listing;
			const customer = tx.customer;
			const provider = tx.provider;

			if (listing && typeof listing === 'object') {
				const listingObj = listing as NormalizedListing;
				addExtended(extListing, 'metadata', listingObj.metadata);
				addExtended(extListing, 'publicData', listingObj.publicData);
				addExtended(extListing, 'privateData', listingObj.privateData);
			}
			if (customer && typeof customer === 'object') {
				const customerObj = customer as NormalizedUser;
				addExtended(extCustomer, 'metadata', customerObj.profile.metadata);
				addExtended(extCustomer, 'publicData', customerObj.profile?.publicData);
				addExtended(extCustomer, 'protectedData', customerObj.profile?.protectedData);
				addExtended(extCustomer, 'privateData', customerObj.profile.privateData);
			}
			if (provider && typeof provider === 'object') {
				const providerObj = provider as NormalizedUser;
				addExtended(extProvider, 'metadata', providerObj.profile.metadata);
				addExtended(extProvider, 'publicData', providerObj.profile.publicData);
				addExtended(extProvider, 'protectedData', providerObj.profile.protectedData);
				addExtended(extProvider, 'privateData', providerObj.profile.privateData);
			}
		}

		fetched += data.length;
		page += 1;

		if (meta?.totalPages && page > meta.totalPages) break;
	}

	this.logger.info(`[Sharetribe] Fetched ${fetched} transactions`);
	return mostRecentTimestamp;
}

/**
 * Fetch listings and learn from them
 */
async function fetchListings(
	this: ILoadOptionsFunctions,
	extListing: Record<string, string>,
	fetchLimit: number,
	lastTimestamp?: string,
	isIncremental = false,
): Promise<string | undefined> {
	let page = 1,
		fetched = 0;
	const perPage = Math.min(100, fetchLimit);
	let mostRecentTimestamp: string | undefined = lastTimestamp;

	const queryParams: IDataObject = {
		page,
		per_page: perPage,
		expand: true,
		sort: 'createdAt',
		order: 'desc',
		'fields.listing': 'id,metadata,publicData,privateData,createdAt',
	};

	// For incremental fetch, query only new listings
	if (isIncremental && lastTimestamp) {
		queryParams.createdAt = lastTimestamp;
		this.logger.info(`[Sharetribe] Fetching listings created after ${lastTimestamp}`);
	}

	while (fetched < fetchLimit) {
		const resp = await integrationApiRequest.call(this, 'GET', 'listings/query', {
			...queryParams,
			page,
		});

		const data = resp?.data ?? resp;
		const included = resp?.included || [];
		const meta = resp?.meta;

		if (!Array.isArray(data) || data.length === 0) break;

		for (const resource of data) {
			const listing = normalizeItem(resource as ResourceObject, included);

			// Track most recent listing timestamp
			if (listing.createdAt) {
				const listingTimestamp = String(listing.createdAt);
				if (!mostRecentTimestamp || listingTimestamp > mostRecentTimestamp) {
					mostRecentTimestamp = listingTimestamp;
				}
			}

			const listingObj = listing as NormalizedListing;
			addExtended(extListing, 'metadata', listingObj.metadata);
			addExtended(extListing, 'publicData', listingObj.publicData);
			addExtended(extListing, 'privateData', listingObj.privateData);
		}

		fetched += data.length;
		page += 1;

		if (meta?.totalPages && page > meta.totalPages) break;
	}

	this.logger.info(`[Sharetribe] Fetched ${fetched} listings`);
	return mostRecentTimestamp;
}

/**
 * Fetch users and learn from them
 */
async function fetchUsers(
	this: ILoadOptionsFunctions,
	extCustomer: Record<string, string>,
	extProvider: Record<string, string>,
	fetchLimit: number,
	lastTimestamp?: string,
	isIncremental = false,
): Promise<string | undefined> {
	let page = 1,
		fetched = 0;
	const perPage = Math.min(100, fetchLimit);
	let mostRecentTimestamp: string | undefined = lastTimestamp;

	const queryParams: IDataObject = {
		page,
		per_page: perPage,
		expand: true,
		sort: 'createdAt',
		order: 'desc',
		'fields.user':
			'id,profile.metadata,profile.publicData,profile.privateData,profile.protectedData,createdAt',
	};

	// For incremental fetch, query only new users
	if (isIncremental && lastTimestamp) {
		queryParams.createdAt = lastTimestamp;
		this.logger.info(`[Sharetribe] Fetching users created after ${lastTimestamp}`);
	}

	while (fetched < fetchLimit) {
		const resp = await integrationApiRequest.call(this, 'GET', 'users/query', {
			...queryParams,
			page,
		});

		const data = resp?.data ?? resp;
		const included = resp?.included || [];
		const meta = resp?.meta;

		if (!Array.isArray(data) || data.length === 0) break;

		for (const resource of data) {
			const user = normalizeItem(resource as ResourceObject, included);

			// Track most recent user timestamp
			if (user.createdAt) {
				const userTimestamp = String(user.createdAt);
				if (!mostRecentTimestamp || userTimestamp > mostRecentTimestamp) {
					mostRecentTimestamp = userTimestamp;
				}
			}

			const userObj = user as NormalizedUser;
			// Learn from user data (could be customer or provider)
			addExtended(extCustomer, 'metadata', userObj.profile?.metadata);
			addExtended(extCustomer, 'publicData', userObj.profile?.publicData);
			addExtended(extCustomer, 'protectedData', userObj.profile?.protectedData);
			addExtended(extCustomer, 'privateData', userObj.profile?.privateData);

			// Users can be both customers and providers, so add to both
			addExtended(extProvider, 'metadata', userObj.profile?.metadata);
			addExtended(extProvider, 'publicData', userObj.profile?.publicData);
			addExtended(extProvider, 'protectedData', userObj.profile?.protectedData);
			addExtended(extProvider, 'privateData', userObj.profile?.privateData);
		}

		fetched += data.length;
		page += 1;

		if (meta?.totalPages && page > meta.totalPages) break;
	}

	this.logger.info(`[Sharetribe] Fetched ${fetched} users`);
	return mostRecentTimestamp;
}

export async function getDiscoveredData(
	this: ILoadOptionsFunctions,
	opts?: { forceRefresh?: boolean },
): Promise<DiscoveredData> {
	const {
		baseUrl,
		integrationClientId,
		marketplaceClientId,
		ttlSec,
		enableAutoPopulate,
		discoveryResourceLimit,
		discoveryCacheTTLMinutes,
	} = await readCreds.call(this);

	if (!enableAutoPopulate) {
		this.logger.info('[Sharetribe] Using fallback data (auto-populate disabled)');
		return {
			processes: new Set(FALLBACK_PROCESSES),
			states: new Set(FALLBACK_STATES),
			transitions: new Set(FALLBACK_TRANSITIONS),
			bookingStates: new Set(FALLBACK_BOOKING_STATES),
			extended: { transaction: {}, listing: {}, customer: {}, provider: {} },
			validated: { transaction: new Set(), listing: new Set(), user: new Set() },
		};
	}

	// Use both client IDs to ensure different credentials don't share cache
	const key = makeCacheKey(
		baseUrl,
		integrationClientId,
		marketplaceClientId,
		enableAutoPopulate,
		discoveryResourceLimit,
		discoveryCacheTTLMinutes,
	);
	const now = Date.now();
	this.logger.debug(`[Sharetribe] Cache key: ${key}, forceRefresh: ${opts?.forceRefresh}`);

	// Clear caches from old credentials
	clearOtherCaches(this, key);

	// Try in-memory cache first
	let existingCachedData: DiscoveredData | undefined;
	if (!opts?.forceRefresh) {
		const mem = getMemCache(key);
		if (mem && mem.expiresAt > now) {
			this.logger.info('[Sharetribe] Cache hit from memory');
			return mem.value;
		}

		// Try workflow static data cache
		const st = readStaticCache(this, key);
		if (st && st.expiresAt > now) {
			setMemCache(key, st);
			return st.value;
		}

		// Cache expired but we can use it for incremental fetch
		if (st && st.value) {
			existingCachedData = st.value;
			this.logger.info('[Sharetribe] Cache expired, will perform incremental update');
		}
	}

	// Check if already discovering
	const inflight = getInflight(key);
	if (inflight) {
		this.logger.info('[Sharetribe] Waiting for in-flight discovery request');
		return inflight;
	}

	// Start discovery (incremental if we have existing data, full otherwise)
	this.logger.info(
		`[Sharetribe] Starting ${existingCachedData ? 'incremental' : 'fresh'} discovery process`,
	);

	// Create promise and set it as inflight IMMEDIATELY to prevent race conditions
	const p = (async () => {
		try {
			const value = await fetchAndDiscover.call(this, existingCachedData);
			const entry = { value, expiresAt: now + ttlSec * 1000 };
			setMemCache(key, entry);
			writeStaticCache(this, key, entry);
			return value;
		} catch (e) {
			this.logger.error('[Sharetribe] Discovery failed:', e);
			throw e;
		} finally {
			deleteInflight(key);
		}
	})();

	setInflight(key, p);
	return p;
}

/**
 * Get or perform validation for extended data fields, with caching
 */
export async function getValidatedFields(
	this: ILoadOptionsFunctions,
	resourceType: 'listing' | 'transaction' | 'user',
	scope: 'metadata' | 'publicData' | 'privateData' | 'protectedData',
): Promise<Set<string>> {
	const discovered = await getDiscoveredData.call(this);

	// If validated cache exists and is populated for this resource, use it
	if (discovered.validated && discovered.validated[resourceType].size > 0) {
		// Filter to only fields matching the scope
		const scopedFields = new Set<string>();
		for (const field of discovered.validated[resourceType]) {
			if (field.startsWith(`${scope}.`)) {
				scopedFields.add(field);
			}
		}
		if (scopedFields.size > 0) {
			this.logger.info(`[Sharetribe] Using cached validation for ${resourceType}.${scope}`);
			return scopedFields;
		}
	}

	// Validation not cached yet, perform it now
	this.logger.info(`[Sharetribe] Performing validation for ${resourceType}.${scope}`);

	// Collect fields to validate from all relevant sources
	const sources =
		resourceType === 'listing'
			? [discovered.extended.listing]
			: resourceType === 'transaction'
				? [discovered.extended.transaction]
				: [discovered.extended.customer, discovered.extended.provider];

	const fieldsToValidate: Array<{ key: string; dataType: string }> = [];
	for (const data of sources) {
		for (const [k, v] of Object.entries(data)) {
			if (k.startsWith(`${scope}.`)) {
				fieldsToValidate.push({ key: k, dataType: v });
			}
		}
	}

	if (fieldsToValidate.length === 0) {
		return new Set();
	}

	// Perform batch validation
	const validationResults = await batchValidateExtendedDataFields.call(
		this,
		resourceType,
		fieldsToValidate,
		'filter',
	);

	// Collect valid fields
	const validFields = new Set<string>();
	for (const [key, isValid] of validationResults.entries()) {
		if (isValid) {
			validFields.add(key);
		}
	}

	// Cache the validated fields back to discovered data
	if (!discovered.validated) {
		discovered.validated = {
			transaction: new Set(),
			listing: new Set(),
			user: new Set(),
		};
	}
	for (const field of validFields) {
		discovered.validated[resourceType].add(field);
	}

	// Update the cache with new validation results
	const {
		baseUrl,
		integrationClientId,
		marketplaceClientId,
		ttlSec,
		enableAutoPopulate,
		discoveryResourceLimit,
		discoveryCacheTTLMinutes,
	} = await readCreds.call(this);
	const key = makeCacheKey(
		baseUrl,
		integrationClientId,
		marketplaceClientId,
		enableAutoPopulate,
		discoveryResourceLimit,
		discoveryCacheTTLMinutes,
	);
	const now = Date.now();
	const entry = { value: discovered, expiresAt: now + ttlSec * 1000 };
	setMemCache(key, entry);
	writeStaticCache(this, key, entry);

	this.logger.info(
		`[Sharetribe] Cached ${validFields.size} validated fields for ${resourceType}.${scope}`,
	);
	return validFields;
}

export function toOptions(values: Set<string>): INodePropertyOptions[] {
	const arr = Array.from(values).sort((a, b) => a.localeCompare(b));
	return arr.map((v) => ({
		name: v
			.replace(/^(state\/|transition\/)/, '')
			.split('-')
			.map((s) => s.charAt(0).toUpperCase() + s.slice(1))
			.join(' '),
		value: v,
	}));
}

/* ----------------------------- PROBE FUNCTIONS ----------------------------- */

type ProbeResult = {
	ok: boolean;
	http?: number;
	errorCode?: string;
	message?: string;
};

async function probeExtendedField(
	this: ILoadOptionsFunctions,
	resourceType: 'listing' | 'transaction' | 'user',
	fullKey: string,
	sampleValue: unknown,
): Promise<ProbeResult> {
	this.logger.info(`[Sharetribe] Probing ${resourceType} field: ${fullKey}`);
	try {
		const [scope, key] = fullKey.split('.');
		if (!scope || !key) return { ok: false, message: 'Invalid key format' };

		// Map resource type to query endpoint
		const endpointMap = {
			listing: 'listings/query',
			transaction: 'transactions/query',
			user: 'users/query',
		};
		const endpoint = endpointMap[resourceType];

		// Map scope to query parameter prefix (e.g., 'publicData' -> 'pub')
		const prefixMap: Record<string, string> = {
			metadata: 'meta_',
			publicData: 'pub_',
			privateData: 'priv_',
			protectedData: 'prot_',
		};
		const prefix = prefixMap[scope];
		if (!prefix) return { ok: false, message: 'Invalid extended data scope' };

		// Binary probe: Test with an impossible filter value first
		// If the API accepts the field, it should return 0 results (or error)
		// If the API ignores the field, it returns all results (same as no filter)
		const impossibleValue =
			typeof sampleValue === 'number'
				? -999999999
				: typeof sampleValue === 'boolean'
					? 'NOT_A_BOOLEAN'
					: '___IMPOSSIBLE_VALUE_THAT_SHOULD_NOT_EXIST___';

		const probeQs: IDataObject = {
			page: 1,
			per_page: 1,
			expand: false,
			[`${prefix}${key}`]: impossibleValue,
		};

		const probeResponse = (await integrationApiRequest.call(this, 'GET', endpoint, probeQs)) as {
			data?: unknown[];
			meta?: { totalItems?: number };
		};
		const probeTotal = probeResponse?.meta?.totalItems ?? probeResponse?.data?.length ?? 0;

		// If we got results with an impossible filter, the API is ignoring the field
		if (probeTotal > 0) {
			this.logger.info(
				`[Sharetribe] Probe failed: ${fullKey} - filter ignored by API (got ${probeTotal} results with impossible value)`,
			);
			return {
				ok: false,
				message: 'Filter parameter ignored by API (impossible value returned results)',
			};
		}

		// Field is accepted by API
		this.logger.info(`[Sharetribe] Probe successful: ${fullKey}`);
		return { ok: true };
	} catch (e: unknown) {
		const error = e as {
			response?: { status?: number; data?: { code?: string; message?: string } };
			message?: string;
		};
		const http = error?.response?.status;
		const code = error?.response?.data?.code;
		const msg = error?.response?.data?.message || error?.message;
		this.logger.info(`[Sharetribe] Probe failed: ${fullKey} - ${msg}`);
		return { ok: false, http, errorCode: code, message: msg };
	}
}

async function probeSortField(
	this: ILoadOptionsFunctions,
	resourceType: 'listing' | 'transaction',
	fullKey: string,
): Promise<ProbeResult> {
	this.logger.info(`[Sharetribe] Probing sort ${resourceType} field: ${fullKey}`);
	try {
		const [scope, key] = fullKey.split('.');
		if (!scope || !key) return { ok: false, message: 'Invalid key format' };

		// Map scope prefix to sort key prefix
		const prefixMap: Record<string, string> = {
			metadata: 'meta',
			publicData: 'pub',
			privateData: 'priv',
			protectedData: 'prot',
		};
		const sortKey = prefixMap[scope] ? `${prefixMap[scope]}_${key}` : key;

		// Map resource type to query endpoint
		const endpointMap = {
			listing: 'listings/query',
			transaction: 'transactions/query',
		};

		const qs = {
			page: 1,
			per_page: 1,
			expand: false,
			sort: sortKey,
		};

		await integrationApiRequest.call(this, 'GET', endpointMap[resourceType], qs);
		this.logger.info(`[Sharetribe] Sort probe successful: ${fullKey}`);
		return { ok: true };
	} catch (e: unknown) {
		const error = e as {
			response?: { status?: number; data?: { code?: string; message?: string } };
			message?: string;
		};
		const http = error?.response?.status;
		const code = error?.response?.data?.code;
		const msg = error?.response?.data?.message || error?.message;
		this.logger.info(`[Sharetribe] Sort probe failed: ${fullKey} - ${msg}`);
		return { ok: false, http, errorCode: code, message: msg };
	}
}

/**
 * Binary elimination probe: recursively split fields and test to find valid ones
 */
async function binaryEliminationProbe(
	context: ILoadOptionsFunctions,
	endpoint: string,
	fields: Array<{ key: string; dataType: string }>,
	prefixMap: Record<string, string>,
): Promise<Set<string>> {
	if (fields.length === 0) return new Set();

	// Base case: single field, test it
	if (fields.length === 1) {
		const field = fields[0];
		const [scope, key] = field.key.split('.');
		const prefix = prefixMap[scope];
		if (!prefix) return new Set();

		const impossibleValue =
			field.dataType === 'boolean' || field.dataType === 'number' || field.dataType === 'long'
				? -999999999
				: '___IMPOSSIBLE___';

		const qs: IDataObject = {
			page: 1,
			per_page: 1,
			expand: false,
			[`${prefix}${key}`]: impossibleValue,
		};

		try {
			const response = (await integrationApiRequest.call(context, 'GET', endpoint, qs)) as {
				data?: unknown[];
				meta?: { totalItems?: number };
			};
			const total = response?.meta?.totalItems ?? response?.data?.length ?? 0;
			// 0 results = field is valid
			return total === 0 ? new Set([field.key]) : new Set();
		} catch {
			return new Set();
		}
	}

	// Recursive case: split in half
	const mid = Math.floor(fields.length / 2);
	const leftHalf = fields.slice(0, mid);
	const rightHalf = fields.slice(mid);

	// Test left half
	const leftQs: IDataObject = {
		page: 1,
		per_page: 1,
		expand: false,
	};
	for (const field of leftHalf) {
		const [scope, key] = field.key.split('.');
		const prefix = prefixMap[scope];
		if (!prefix) continue;

		const impossibleValue =
			field.dataType === 'boolean' || field.dataType === 'number' || field.dataType === 'long'
				? -999999999
				: '___IMPOSSIBLE___';
		leftQs[`${prefix}${key}`] = impossibleValue;
	}

	// Test right half
	const rightQs: IDataObject = {
		page: 1,
		per_page: 1,
		expand: false,
	};
	for (const field of rightHalf) {
		const [scope, key] = field.key.split('.');
		const prefix = prefixMap[scope];
		if (!prefix) continue;

		const impossibleValue =
			field.dataType === 'boolean' || field.dataType === 'number' || field.dataType === 'long'
				? -999999999
				: '___IMPOSSIBLE___';
		rightQs[`${prefix}${key}`] = impossibleValue;
	}

	const [leftResponse, rightResponse] = await Promise.all([
		integrationApiRequest.call(context, 'GET', endpoint, leftQs) as Promise<{
			data?: unknown[];
			meta?: { totalItems?: number };
		}>,
		integrationApiRequest.call(context, 'GET', endpoint, rightQs) as Promise<{
			data?: unknown[];
			meta?: { totalItems?: number };
		}>,
	]);

	const leftTotal = leftResponse?.meta?.totalItems ?? leftResponse?.data?.length ?? 0;
	const rightTotal = rightResponse?.meta?.totalItems ?? rightResponse?.data?.length ?? 0;

	const validFields = new Set<string>();

	// Recursively probe halves that returned 0 (meaning they have valid fields)
	if (leftTotal === 0) {
		const leftValid = await binaryEliminationProbe(context, endpoint, leftHalf, prefixMap);
		leftValid.forEach((k) => validFields.add(k));
	}
	if (rightTotal === 0) {
		const rightValid = await binaryEliminationProbe(context, endpoint, rightHalf, prefixMap);
		rightValid.forEach((k) => validFields.add(k));
	}

	return validFields;
}

/**
 * Batch validate multiple extended data fields at once
 * Uses binary elimination to efficiently find valid fields
 */
export async function batchValidateExtendedDataFields(
	this: ILoadOptionsFunctions,
	resourceType: 'listing' | 'transaction' | 'user',
	fields: Array<{ key: string; dataType: string }>,
	purpose: 'filter' | 'sort' = 'filter',
): Promise<Map<string, boolean>> {
	const results = new Map<string, boolean>();

	if (purpose !== 'filter' || fields.length === 0) {
		// Sorting doesn't support batch, return all as false
		fields.forEach((f) => results.set(f.key, false));
		return results;
	}

	// Group fields by their validity (pre-filter before probing)
	const validFields: typeof fields = [];
	for (const field of fields) {
		const [scope] = field.key.split('.');

		// Check resource/scope combination
		let skipReason: string | null = null;
		if (resourceType === 'listing' && !['publicData', 'metadata'].includes(scope)) {
			skipReason = 'listings only support publicData and metadata filtering';
		} else if (resourceType === 'transaction' && !['metadata', 'protectedData'].includes(scope)) {
			skipReason = 'transactions only support metadata and protectedData filtering';
		} else if (resourceType === 'user' && !['metadata', 'protectedData'].includes(scope)) {
			skipReason = 'users only support metadata and protectedData filtering';
		}

		// Check data type
		if (!skipReason && ['object', 'array'].includes(field.dataType)) {
			skipReason = 'complex types cannot be filtered';
		}

		if (skipReason) {
			this.logger.debug(`[Sharetribe] Skipping ${field.key}: ${skipReason}`);
			results.set(field.key, false);
		} else {
			validFields.push(field);
		}
	}

	if (validFields.length === 0) {
		return results;
	}

	// Build batch probe query with all fields at once
	const endpointMap = {
		listing: 'listings/query',
		transaction: 'transactions/query',
		user: 'users/query',
	};
	const endpoint = endpointMap[resourceType];

	const prefixMap: Record<string, string> = {
		metadata: 'meta_',
		publicData: 'pub_',
		privateData: 'priv_',
		protectedData: 'prot_',
	};

	try {
		this.logger.info(
			`[Sharetribe] Binary elimination probe for ${validFields.length} ${resourceType} fields`,
		);

		// Use binary elimination to efficiently find valid fields
		const validatedFields = await binaryEliminationProbe(this, endpoint, validFields, prefixMap);

		// Mark results
		for (const field of validFields) {
			results.set(field.key, validatedFields.has(field.key));
		}

		this.logger.info(
			`[Sharetribe] Binary elimination found ${validatedFields.size}/${validFields.length} valid fields`,
		);
	} catch {
		// On error, fall back to individual validation
		this.logger.warn('[Sharetribe] Binary elimination failed, falling back to individual probes');
		for (const field of validFields) {
			const sampleValue =
				field.dataType === 'boolean'
					? true
					: field.dataType === 'number' || field.dataType === 'long'
						? 1
						: 'test';
			const result = await probeExtendedField.call(this, resourceType, field.key, sampleValue);
			results.set(field.key, result.ok);
		}
	}

	return results;
}

export async function validateExtendedDataField(
	this: ILoadOptionsFunctions,
	resourceType: 'listing' | 'transaction' | 'user',
	fullKey: string,
	purpose: 'filter' | 'sort' = 'filter',
): Promise<ProbeResult> {
	const [scope] = fullKey.split('.');

	// Skip probing for known invalid combinations based on API documentation
	if (purpose === 'filter') {
		// Listings: Only publicData and metadata support filtering
		if (resourceType === 'listing' && !['publicData', 'metadata'].includes(scope)) {
			this.logger.debug(
				`[Sharetribe] Skipping probe for ${fullKey}: listings only support publicData and metadata filtering`,
			);
			return { ok: false, message: 'Listings only support publicData and metadata filtering' };
		}
		// Transactions: Only metadata and protectedData support filtering
		if (resourceType === 'transaction' && !['metadata', 'protectedData'].includes(scope)) {
			this.logger.debug(
				`[Sharetribe] Skipping probe for ${fullKey}: transactions only support metadata and protectedData filtering`,
			);
			return {
				ok: false,
				message: 'Transactions only support metadata and protectedData filtering',
			};
		}
		// Users: Only metadata and protectedData support filtering
		if (resourceType === 'user' && !['metadata', 'protectedData'].includes(scope)) {
			this.logger.debug(
				`[Sharetribe] Skipping probe for ${fullKey}: users only support metadata and protectedData filtering`,
			);
			return { ok: false, message: 'Users only support metadata and protectedData filtering' };
		}
	}

	const discovered = await getDiscoveredData.call(this);

	// Find the data type and sample value from discovered data
	let sampleValue: unknown = null;
	let dataType: string | undefined;
	for (const src of Object.values(discovered.extended)) {
		if (src[fullKey]) {
			dataType = src[fullKey];
			break;
		}
	}

	if (!dataType) {
		return { ok: false, message: 'No sample data found' };
	}

	// Skip probing for complex types that can't be filtered per API documentation
	// Only schema types: enum, long, boolean, text are queryable
	if (purpose === 'filter') {
		const unfilterableTypes = ['object', 'array'];
		if (unfilterableTypes.includes(dataType)) {
			this.logger.debug(
				`[Sharetribe] Skipping probe for ${fullKey}: type '${dataType}' cannot be filtered (only enum, long, boolean, text are queryable)`,
			);
			return {
				ok: false,
				message: `Extended data type '${dataType}' cannot be filtered (only enum, long, boolean, text are queryable)`,
			};
		}
	}

	// Generate sample value based on type
	switch (dataType) {
		case 'boolean':
			sampleValue = true;
			break;
		case 'number':
		case 'long':
			sampleValue = 1;
			break;
		case 'string':
			sampleValue = 'test';
			break;
		default:
			sampleValue = 'test';
	}

	// Use the appropriate probe function
	if (purpose === 'filter') {
		return probeExtendedField.call(this, resourceType, fullKey, sampleValue);
	} else {
		return probeSortField.call(this, resourceType as 'listing' | 'transaction', fullKey);
	}
}

/* ----------------------- Assets (categories) + cache ----------------------- */

const _assetCache = new Map<string, IDataObject | null>();

export async function fetchAssetJson(
	this: ILoadOptionsFunctions,
	assetPath: string,
): Promise<IDataObject | null> {
	const { enableAutoPopulate, marketplaceClientId } = await readCreds.call(this);

	if (!enableAutoPopulate || !marketplaceClientId) {
		this.logger.info(
			'[Sharetribe] Asset fetch skipped (auto-populate disabled or no API client ID)',
		);
		return null;
	}

	const key = `${marketplaceClientId}::${assetPath}`;
	if (_assetCache.has(key)) {
		this.logger.info(`[Sharetribe] Asset cache hit: ${assetPath}`);
		return _assetCache.get(key) ?? null;
	}

	const url = `https://cdn.st-api.com/v1/assets/pub/${marketplaceClientId}/a/latest/${assetPath}`;
	this.logger.info(`[Sharetribe] Fetching asset: ${assetPath}`);

	try {
		const res = await this.helpers.httpRequest({
			method: 'GET',
			url,
			headers: { Accept: 'application/json' },
			json: true,
		});
		_assetCache.set(key, res);
		this.logger.info(`[Sharetribe] Asset fetched successfully: ${assetPath}`);
		return res;
	} catch (error) {
		this.logger.info(`[Sharetribe] Asset fetch failed: ${assetPath}`, error);
		return null;
	}
}

export function toOpt(nameOrObj: unknown, keyFallback: string): INodePropertyOptions {
	if (typeof nameOrObj === 'string') return { name: nameOrObj, value: nameOrObj };
	const obj = nameOrObj as { name?: string; label?: string; key?: string; id?: string } | undefined;
	const name = obj?.label || obj?.name || keyFallback;
	const value = obj?.key || obj?.id || keyFallback;
	return { name, value };
}

export function getResourceLocatorValue(resourceLocator: unknown): string {
	if (typeof resourceLocator === 'string') {
		return resourceLocator;
	}
	const obj = resourceLocator as { mode?: string; value?: string } | undefined;
	if (obj?.mode === 'list') {
		return obj.value || '';
	} else if (obj?.mode === 'name') {
		return obj.value || '';
	}
	return '';
}

export function extToOptions(extMap: Record<string, string>): INodePropertyOptions[] {
	return Object.entries(extMap)
		.sort((a, b) => a[0].localeCompare(b[0]))
		.map(([k, dataType]) => {
			// Extract just the field name after the scope prefix (e.g., "publicData.categoryLevel1" -> "categoryLevel1")
			const fieldName = k.includes('.') ? k.split('.').slice(1).join('.') : k;

			// Add type hint to help user choose the right condition operator
			const typeHint = dataType === 'string' ? 'enum' : dataType === 'long' ? 'number' : dataType;
			const displayName = `${fieldName} [${typeHint}]`;

			return { name: displayName, value: k };
		});
}
