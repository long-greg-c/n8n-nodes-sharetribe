import type {
	IDataObject,
	IExecuteFunctions,
	ILoadOptionsFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	IWebhookFunctions,
	JsonObject,
	IPollFunctions,
	INodeExecutionData,
	INodeProperties,
	INode,
} from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';
import { apiRequest } from './transport';
import {
	EXTENDED_DATA_TYPES,
	EXTENDED_DATA_PREFIXES,
	QUERY_PARAMS,
	ApiResource,
	Endpoints,
	UiOperation,
	UiResource,
	UI_RESOURCES,
	UI_OPERATIONS,
	COMMON_FILTER_OPTIONS,
	COMMON_SORT_FIELDS,
	TRANSACTION_FILTER_OPTIONS,
	SORT_DIRECTIONS,
	RESULT_MODES,
	ExtendedDataType,
	RelationshipPath,
	LoadOptionsMethod,
} from './constants';
import type { SharetribeApiResponseType, SharetribeResource } from './types';
import moment, { type Moment } from 'moment';

// ===================================
// Property Name Constants
// ===================================

/**
 * Standard property names used across node descriptions
 * Use these constants instead of string literals to prevent typos
 */
export const PROPERTY_NAMES = {
	/** Resource type selector (user, listing, transaction, etc.) */
	RESOURCE: 'resource',
	/** Operation type selector (get, create, update, query, etc.) */
	OPERATION: 'operation',
	/** Include options (which fields and relationships to return) */
	INCLUDE_OPTIONS: 'includeOptions',
	/** Result mode (returnAll, limit, totals) */
	RESULT_MODE: 'resultMode',
	/** Start query mode for triggers */
	START_QUERY_MODE: 'startQueryMode',
	/** Resource filter mode */
	RESOURCE_FILTER: 'resourceFilter',
	/** Condition type for filters */
	CONDITION_TYPE: 'condition_type',
	/** Sort direction (ASC/DESC) */
	DIRECTION: 'direction',
} as const;

// ===================================
// Error Handling
// ===================================

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
 * Handles Sharetribe API error responses and formats them for better UX.
 * Based on the error structure defined in the Sharetribe API specification.
 *
 * @param context - The n8n execution context
 * @param error - The error object from the API request
 * @throws NodeApiError with formatted error message
 */
function handleSharetribeApiError(
	context:
		| IExecuteFunctions
		| IWebhookFunctions
		| IHookFunctions
		| ILoadOptionsFunctions
		| IPollFunctions,
	error: JsonObject,
): never {
	// Parse Sharetribe API error responses
	const errorResponse = error as {
		response?: {
			body?: {
				errors?: SharetribeApiError[];
			};
		};
	};

	if (
		errorResponse.response?.body?.errors &&
		Array.isArray(errorResponse.response.body.errors) &&
		errorResponse.response.body.errors.length > 0
	) {
		const apiErrors = errorResponse.response.body.errors;
		const primaryError = apiErrors[0];

		// Build a user-friendly error message
		let errorMessage = primaryError.title || 'API request failed';

		if (primaryError.details) {
			errorMessage += `<br><br>${primaryError.details}`;
		}

		// Add information about the error code and status
		const errorInfo: string[] = [];
		if (primaryError.status) {
			errorInfo.push(`Status: ${primaryError.status}`);
		}
		if (primaryError.code) {
			errorInfo.push(`Code: ${primaryError.code}`);
		}
		if (primaryError.id) {
			errorInfo.push(`Error ID: ${primaryError.id}`);
		}

		if (errorInfo.length > 0) {
			errorMessage += `<br><br>${errorInfo.join(' | ')}`;
		}

		// Add source information if available (parameter validation errors)
		if (primaryError.source?.path) {
			const paramPath = primaryError.source.path.join('.');
			errorMessage += `<br><br>Parameter: ${paramPath} (${primaryError.source.type})`;
		}

		// If there are multiple errors, list them
		if (apiErrors.length > 1) {
			errorMessage += `<br><br>Additional errors:`;
			for (let i = 1; i < apiErrors.length; i++) {
				const additionalError = apiErrors[i];
				if (additionalError) {
					errorMessage += `<br>• ${additionalError.title}`;
					if (additionalError.source?.path) {
						errorMessage += ` (${additionalError.source.path.join('.')})`;
					}
				}
			}
		}

		throw new NodeApiError(context.getNode(), error as JsonObject, {
			message: errorMessage,
			description: 'Sharetribe API Error',
		});
	}

	// Fallback for non-Sharetribe API errors
	throw new NodeApiError(context.getNode(), error as JsonObject);
}

// ===================================
// HTTP Request Functions
// ===================================

export async function sharetribeApiRequest(
	this:
		| IExecuteFunctions
		| IWebhookFunctions
		| IHookFunctions
		| ILoadOptionsFunctions
		| IPollFunctions,
	method: IHttpRequestMethods,
	resource: string,

	body: IDataObject = {},
	query: IDataObject = {},
	option: IDataObject = {},
): Promise<IDataObject> {
	const credentials = await this.getCredentials('sharetribeOAuth2Api');

	let options: IHttpRequestOptions = {
		baseURL: (credentials.baseUrl as string) + '/v1/integration_api',
		method,
		body,
		qs: query,
		url: resource,
	};

	if (!Object.keys(query).length) {
		delete options.qs;
	}
	options = Object.assign({}, options, option);
	try {
		const response = await this.helpers.httpRequestWithAuthentication.call(
			this,
			'sharetribeOAuth2Api',
			options,
		);
		return response;
	} catch (error) {
		handleSharetribeApiError(this, error);
	}
}

// ===================================
// Response Configuration Nodes
// ===================================

/**
 * User relationship field options
 */
const USER_RELATIONSHIP_OPTIONS = [
	{ name: 'Abbreviated Name', value: 'abbreviatedName', description: "User's name initials" },
	{ name: 'Bio', value: 'bio', description: "User's biographical text" },
	{ name: 'Created At', value: 'createdAt', description: 'Date and time the user signed up' },
	{ name: 'Deleted', value: 'deleted', description: 'Flag indicating if the user is deleted' },
	{ name: 'Display Name', value: 'displayName', description: "User's chosen display name" },
	{ name: 'Email', value: 'email', description: "User's email address" },
	{
		name: 'Email Verified',
		value: 'emailVerified',
		description: 'Flag indicating if email is verified',
	},
	{ name: 'First Name', value: 'firstName', description: "User's first name" },
	{
		name: 'Identity Providers',
		value: 'identityProviders',
		description: 'Associated identity provider accounts',
	},
	{ name: 'Last Name', value: 'lastName', description: "User's last name" },
	{ name: 'Marketplace', value: 'marketplace', description: 'The marketplace of the user' },
	{ name: 'Metadata', value: 'metadata', description: 'Public metadata' },
	{ name: 'Pending Email', value: 'pendingEmail', description: 'Pending email change' },
	{
		name: 'Effective Permission Set',
		value: 'effectivePermissionSet',
		description: "User's final permissions, determined after considering all factors",
	},
	{ name: 'Private Data', value: 'privateData', description: 'Private extended data' },
	{ name: 'Profile Image', value: 'profileImage', description: "User's profile image" },
	{ name: 'Protected Data', value: 'protectedData', description: 'Protected extended data' },
	{ name: 'Public Data', value: 'publicData', description: 'Public extended data' },
	{ name: 'State', value: 'state', description: "User's state" },
	{ name: 'Stripe Account', value: 'stripeAccount', description: "User's Stripe Account" },
	{
		name: 'Stripe Connected',
		value: 'stripeConnected',
		description: 'Flag indicating Stripe account creation',
	},
];

/**
 * Listing relationship field options
 */
const LISTING_RELATIONSHIP_OPTIONS = [
	{ name: 'Author', value: 'author', description: 'Listing author' },
	{
		name: 'Availability Plan',
		value: 'availabilityPlan',
		description: 'Listing availability plan with type and timezone',
	},
	{
		name: 'Categories',
		value: 'categories',
		description: 'Categories for the listing - all levels',
	},
	{ name: 'Created At', value: 'createdAt', description: 'Date and time the listing was created' },
	{
		name: 'Current Stock',
		value: 'currentStock',
		description: "The listing's currently available stock",
	},
	{ name: 'Description', value: 'description', description: 'Listing description' },
	{ name: 'Geolocation', value: 'geolocation', description: 'Listing location coordinates' },
	{ name: 'Images', value: 'images', description: 'Listing images' },
	{ name: 'Marketplace', value: 'marketplace', description: 'The marketplace of the listing' },
	{ name: 'Metadata', value: 'metadata', description: 'Listing metadata' },
	{ name: 'Price', value: 'price', description: 'Listing price' },
	{ name: 'Private Data', value: 'privateData', description: 'Private extended data' },
	{ name: 'Public Data', value: 'publicData', description: 'Public extended data' },
	{ name: 'State', value: 'state', description: 'Listing state' },
	{ name: 'Title', value: 'title', description: 'Listing title' },
];

/**
 * Transaction relationship field options
 */
const TRANSACTION_RELATIONSHIP_OPTIONS = [
	{ name: 'Booking', value: 'booking', description: 'Transaction booking details' },
	{
		name: 'Created At',
		value: 'createdAt',
		description: 'Date and time the transaction was created',
	},
	{ name: 'Customer', value: 'customer', description: 'Transaction customer' },
	{ name: 'Last Transition', value: 'lastTransition', description: 'Last state transition' },
	{
		name: 'Last Transitioned At',
		value: 'lastTransitionedAt',
		description: 'Time of last transition',
	},
	{ name: 'Line Items', value: 'lineItems', description: 'Transaction line items' },
	{ name: 'Listing', value: 'listing', description: 'Associated listing' },
	{ name: 'Messages', value: 'messages', description: 'Transaction messages' },
	{ name: 'Metadata', value: 'metadata', description: 'Transaction metadata' },
	{ name: 'Payin Total', value: 'payinTotal', description: 'Amount paid by the customer' },
	{ name: 'Payout Total', value: 'payoutTotal', description: 'Amount paid to the provider' },
	{ name: 'Process Name', value: 'processName', description: 'Transaction process name' },
	{ name: 'Process Version', value: 'processVersion', description: 'Transaction process version' },
	{ name: 'Protected Data', value: 'protectedData', description: "Transaction's protected data" },
	{ name: 'Provider', value: 'provider', description: 'Transaction provider' },
	{ name: 'Reviews', value: 'reviews', description: 'Transaction reviews' },
	{
		name: 'State',
		value: 'state',
		description: 'Transaction state, determined by last transition',
	},
	{ name: 'Transitions', value: 'transitions', description: "Transaction's transition history" },
];

/**
 * Availability exception relationship field options
 */
const AVAILABILITY_EXCEPTION_RELATIONSHIP_OPTIONS = [
	{ name: 'End', value: 'end', description: 'Exception end date/time' },
	{ name: 'Listing', value: 'listing', description: 'Associated listing' },
	{ name: 'Seats', value: 'seats', description: 'Number of seats affected' },
	{ name: 'Start', value: 'start', description: 'Exception start date/time' },
];

/**
 * Stock adjustment relationship field options
 */
const STOCK_RELATIONSHIP_OPTIONS = [
	{ name: 'Adjustment Time', value: 'at', description: 'When the adjustment takes effect' },
	{ name: 'Listing', value: 'listing', description: 'Associated listing' },
	{ name: 'Quantity', value: 'quantity', description: 'Adjustment quantity' },
	{
		name: 'Stock Reservation',
		value: 'stockReservation',
		description: 'Related stock reservation',
	},
];

/**
 * Resource-specific relationship mapping
 */
const RESOURCE_RELATIONSHIPS: Record<UiResource, string[]> = {
	[UI_RESOURCES.USER]: ['marketplace', 'profileImage', 'stripeAccount', 'effectivePermissionSet'],
	[UI_RESOURCES.LISTING]: ['marketplace', 'author', 'images', 'currentStock'],
	[UI_RESOURCES.TRANSACTION]: ['customer', 'provider', 'listing', 'booking', 'reviews', 'messages'],
	[UI_RESOURCES.MARKETPLACE]: [],
	[UI_RESOURCES.STOCK]: ['listing', 'stockReservation'],
	[UI_RESOURCES.STOCK_RESERVATION]: [],
	[UI_RESOURCES.IMAGE]: [],
	[UI_RESOURCES.AVAILABILITY_EXCEPTIONS]: ['listing'],
};

/**
 * Default field selections per resource and operation type
 */
const RESOURCE_DEFAULTS = {
	user: {
		single: ['firstName', 'lastName', 'email'],
		many: ['firstName', 'lastName', 'email'],
	},
	listing: {
		single: ['title', 'state', 'createdAt'],
		many: ['title', 'state', 'createdAt'],
	},
	transaction: {
		single: ['state', 'lastTransition', 'lastTransitionedAt', 'processName'],
		many: ['state', 'lastTransition', 'lastTransitionedAt', 'processName'],
	},
	availabilityException: {
		single: ['start', 'end', 'seats'],
		many: ['start', 'end', 'seats'],
	},
	stock: {
		single: ['at', 'quantity'],
		many: ['at', 'quantity'],
	},
} as const;

/**
 * Gets relationship field options for a specific resource
 */
function getRelationshipOptions(resource: UiResource) {
	switch (resource) {
		case UI_RESOURCES.LISTING:
			return LISTING_RELATIONSHIP_OPTIONS;
		case UI_RESOURCES.TRANSACTION:
			return TRANSACTION_RELATIONSHIP_OPTIONS;
		case UI_RESOURCES.AVAILABILITY_EXCEPTIONS:
			return AVAILABILITY_EXCEPTION_RELATIONSHIP_OPTIONS;
		case UI_RESOURCES.STOCK:
			return STOCK_RELATIONSHIP_OPTIONS;
		default:
			return USER_RELATIONSHIP_OPTIONS;
	}
}

/**
 * Gets default field selections for a resource and operation
 */
function getDefaultSelections(resource: UiResource, isMany: boolean) {
	let defaults;
	switch (resource) {
		case UI_RESOURCES.LISTING:
			defaults = RESOURCE_DEFAULTS.listing;
			break;
		case UI_RESOURCES.TRANSACTION:
			defaults = RESOURCE_DEFAULTS.transaction;
			break;
		case UI_RESOURCES.AVAILABILITY_EXCEPTIONS:
			defaults = RESOURCE_DEFAULTS.availabilityException;
			break;
		case UI_RESOURCES.STOCK:
			defaults = RESOURCE_DEFAULTS.stock;
			break;
		default:
			defaults = RESOURCE_DEFAULTS.user;
	}
	return isMany ? defaults.many : defaults.single;
}

/**
 * Creates relationship/include options fields for a resource operation
 * Generates the UI field that allows users to select which related resources and attributes to include in the response
 *
 * @param operations - The UI operation type (e.g., UI_OPERATIONS.GET, UI_OPERATIONS.GET_MANY)
 * @param resource - The UI resource type (e.g., UI_RESOURCES.USER, UI_RESOURCES.LISTING)
 * @returns Array of INodeProperties for relationship selection (author, images, listing, customer, provider, etc.)
 *
 * @example
 * ```typescript
 * createRelationshipFields(UI_OPERATIONS.GET, UI_RESOURCES.LISTING)
 * // Returns fields for selecting listing relationships like author, images, currentStock
 *
 * createRelationshipFields(UI_OPERATIONS.GET_MANY, UI_RESOURCES.TRANSACTION)
 * // Returns fields for selecting transaction relationships like customer, provider, listing, booking
 * ```
 *
 * @remarks
 * - For USER resource: Returns profile fields and extended data options
 * - For LISTING resource: Returns author, images, currentStock, and extended data
 * - For TRANSACTION resource: Returns customer, provider, listing, booking, reviews, messages
 * - The field visibility adapts based on operation type (get vs getMany)
 */
export const createRelationshipFields = (
	operations: UiOperation,
	resource: UiResource,
): INodeProperties[] => {
	const isMany = operations === UI_OPERATIONS.GET_MANY;
	const options = getRelationshipOptions(resource);
	const desiredDefaults = getDefaultSelections(resource, isMany);
	const relationshipPaths = RESOURCE_RELATIONSHIPS[resource];

	// Filter defaults to only include valid options
	const optionValues = new Set(options.map((o) => o.value));
	const defaultSelection = desiredDefaults.filter((v) => optionValues.has(v));

	const nodes: INodeProperties[] = [
		{
			displayName: 'Attributes to Return',
			name: PROPERTY_NAMES.INCLUDE_OPTIONS,
			type: 'multiOptions',
			placeholder: 'Add Response Options',
			displayOptions: {
				show: {
					[PROPERTY_NAMES.RESOURCE]: [resource],
					[PROPERTY_NAMES.OPERATION]: [operations],
				},
			},
			default: [...defaultSelection],
			options,
		},
	];

	// Add warning notice for getMany operations when relationships are selected
	if (isMany && relationshipPaths.length > 0) {
		nodes.push({
			displayName:
				'Including relationships (author, customer, provider, listing, etc.) is not recommended for large result sets as it significantly increases response size and processing time. Use sparingly or consider fetching related resources separately.',
			name: 'relationshipWarning',
			type: 'notice',
			default: '',
			displayOptions: {
				show: {
					[PROPERTY_NAMES.RESOURCE]: [resource],
					[PROPERTY_NAMES.OPERATION]: [operations],
					[PROPERTY_NAMES.INCLUDE_OPTIONS]: [...relationshipPaths],
				},
			},
		});
	}

	return nodes;
};

// ===================================
// Related Resource Attribute Fields
// ===================================

/**
 * Creates a user attributes field for selecting which user fields to return
 * Used for related user resources like listing author, transaction customer/provider, etc.
 *
 * @param resource - The UI resource type
 * @param operation - The UI operation type
 * @param includeOptionsValues - Array of relationship paths that must be selected in includeOptions for this field to show
 * @param displayName - Display name for the field (default: 'User Attributes to Return')
 * @param description - Field description (default: 'Select which attributes to return for users')
 * @returns INodeProperties configuration for user attributes selection
 *
 * @example
 * ```typescript
 * createUserAttributesField(UI_RESOURCES.LISTING, UI_OPERATIONS.GET, [LISTING_RELATIONSHIPS.AUTHOR])
 * createUserAttributesField(UI_RESOURCES.TRANSACTION, UI_OPERATIONS.GET_MANY, [TRANSACTION_RELATIONSHIPS.CUSTOMER, TRANSACTION_RELATIONSHIPS.PROVIDER])
 * ```
 */
export const createUserAttributesField = (
	resource: UiResource,
	operation: UiOperation,
	includeOptionsValues: RelationshipPath[],
	displayName: string = 'User Attributes to Return',
	description: string = 'Select which attributes to return for users',
): INodeProperties => ({
	displayName,
	name: `userAttributes_${resource}_${operation}`,
	type: 'multiOptions',
	placeholder: 'Add User Attributes',
	displayOptions: {
		show: {
			[PROPERTY_NAMES.RESOURCE]: [resource],
			[PROPERTY_NAMES.OPERATION]: [operation],
			[PROPERTY_NAMES.INCLUDE_OPTIONS]: includeOptionsValues,
		},
	},
	default: ['firstName', 'lastName', 'email'],
	// eslint-disable-next-line n8n-nodes-base/node-param-multi-options-type-unsorted-items
	options: [
		{ name: 'Abbreviated Name', value: 'abbreviatedName', description: "User's name initials" },
		{ name: 'Bio', value: 'bio', description: "User's biographical text" },
		{ name: 'Created At', value: 'createdAt', description: 'Date and time the user signed up' },
		{ name: 'Display Name', value: 'displayName', description: "User's chosen display name" },
		{ name: 'Email', value: 'email', description: "User's email address" },
		{
			name: 'Email Verified',
			value: 'emailVerified',
			description: 'Flag indicating if email is verified',
		},
		{ name: 'First Name', value: 'firstName', description: "User's first name" },
		{ name: 'Last Name', value: 'lastName', description: "User's last name" },
		{ name: 'Profile Image', value: 'profileImage', description: "User's profile image" },
		{ name: 'Private Data', value: 'privateData', description: "User's private extended data" },
		{
			name: 'Protected Data',
			value: 'protectedData',
			description: 'User protected extended data',
		},
		{ name: 'Public Data', value: 'publicData', description: "User's public extended data" },
		{
			name: 'State',
			value: 'state',
			description: "User's state",
		},
	],
	description,
});

/**
 * Creates a listing attributes field for selecting which listing fields to return
 *
 * @param resource - The UI resource type
 * @param operation - The UI operation type
 * @param includeOptionsValues - Array of relationship paths that must be selected in includeOptions for this field to show
 * @param displayName - Display name for the field (default: 'Listing Attributes to Return')
 * @param description - Field description (default: 'Select which attributes to return for the listing')
 * @returns INodeProperties configuration for listing attributes selection
 *
 * @example
 * ```typescript
 * createListingAttributesField(UI_RESOURCES.TRANSACTION, UI_OPERATIONS.GET, [TRANSACTION_RELATIONSHIPS.LISTING])
 * createListingAttributesField(UI_RESOURCES.STOCK, UI_OPERATIONS.GET_MANY, [STOCK_RELATIONSHIPS.LISTING])
 * ```
 */
export const createListingAttributesField = (
	resource: UiResource,
	operation: UiOperation,
	includeOptionsValues: RelationshipPath[],
	displayName: string = 'Listing Attributes to Return',
	description: string = 'Select which attributes to return for the listing',
): INodeProperties => ({
	displayName,
	name: `listingAttributes_${resource}_${operation}`,
	type: 'multiOptions',
	placeholder: 'Add Listing Attributes',
	displayOptions: {
		show: {
			[PROPERTY_NAMES.RESOURCE]: [resource],
			[PROPERTY_NAMES.OPERATION]: [operation],
			[PROPERTY_NAMES.INCLUDE_OPTIONS]: includeOptionsValues,
		},
	},
	default: ['title', 'description', 'state'],
	options: [
		{ name: 'Author', value: 'author', description: 'Listing author (user)' },
		{
			name: 'Availability Plan',
			value: 'availabilityPlan',
			description: 'Listing availability plan',
		},
		{
			name: 'Created At',
			value: 'createdAt',
			description: 'Date and time the listing was created',
		},
		{ name: 'Description', value: 'description', description: 'Listing description' },
		{ name: 'Geolocation', value: 'geolocation', description: 'Listing location coordinates' },
		{ name: 'Images', value: 'images', description: 'Listing images' },
		{ name: 'Marketplace', value: 'marketplace', description: 'The marketplace of the listing' },
		{ name: 'Metadata', value: 'metadata', description: 'Listing metadata' },
		{ name: 'Price', value: 'price', description: 'Listing price' },
		{ name: 'Private Data', value: 'privateData', description: 'Listing private extended data' },
		{ name: 'Public Data', value: 'publicData', description: 'Listing public extended data' },
		{
			name: 'State',
			value: 'state',
			description: 'Listing state (draft, pendingApproval, published, closed)',
		},
		{ name: 'Title', value: 'title', description: 'Listing title' },
	],
	description,
});

/**
 * Creates a conditional user attributes field that shows only when user-type relationships are selected
 * This handles complex scenarios where user attributes should appear based on multiple conditions
 *
 * @param resource - The UI resource type
 * @param operation - The UI operation type
 * @param conditions - Array of conditions that determine when the field should be shown
 * @param displayName - Display name for the field (default: 'User Attributes to Return')
 * @param description - Field description (default: 'Select which attributes to return for users')
 * @returns Array of INodeProperties for conditional user attributes selection
 *
 * @example
 * ```typescript
 * createConditionalUserAttributesField(
 *   UI_RESOURCES.STOCK,
 *   UI_OPERATIONS.GET_MANY,
 *   [{ includeOptionsValue: STOCK_RELATIONSHIPS.LISTING, listingAttributeValue: 'author' }],
 *   'User Attributes to Return'
 * )
 * ```
 */
export const createConditionalUserAttributesField = (
	resource: UiResource,
	operation: UiOperation,
	conditions: {
		/** Show when this relationship path is selected in includeOptions */
		includeOptionsValue?: RelationshipPath;
		/** Show when this listingAttribute value is selected (requires listing in includeOptions) */
		listingAttributeValue?: string;
	}[],
	displayName: string = 'User Attributes to Return',
	description: string = 'Select which attributes to return for users',
): INodeProperties[] => {
	return conditions.map((condition) => {
		const field = createUserAttributesField(
			resource,
			operation,
			condition.includeOptionsValue ? [condition.includeOptionsValue] : [],
			displayName,
			description,
		);

		// If listingAttributeValue is specified, override displayOptions to add that condition
		if (condition.listingAttributeValue) {
			return {
				...field,
				displayOptions: {
					show: {
						[PROPERTY_NAMES.RESOURCE]: [resource],
						[PROPERTY_NAMES.OPERATION]: [operation],
						[PROPERTY_NAMES.INCLUDE_OPTIONS]: condition.includeOptionsValue
							? [condition.includeOptionsValue]
							: [],
						listingAttributes: [condition.listingAttributeValue],
					},
				},
			};
		}

		return field;
	});
};

/**
 * Creates a transaction attributes field for selecting which transaction fields to return
 *
 * @param resource - The UI resource type
 * @param operation - The UI operation type
 * @param includeOptionsValues - Array of relationship paths that must be selected in includeOptions for this field to show
 * @param displayName - Display name for the field (default: 'Transaction Attributes to Return')
 * @param description - Field description (default: 'Select which attributes to return for the transaction')
 * @returns INodeProperties configuration for transaction attributes selection
 *
 * @example
 * ```typescript
 * createTransactionAttributesField(UI_RESOURCES.LISTING, UI_OPERATIONS.GET, [LISTING_RELATIONSHIPS.TRANSACTION])
 * createTransactionAttributesField(UI_RESOURCES.STOCK, UI_OPERATIONS.GET_MANY, ['stockReservation.transaction'])
 * ```
 */
export const createTransactionAttributesField = (
	resource: UiResource,
	operation: UiOperation,
	includeOptionsValues: RelationshipPath[],
	displayName: string = 'Transaction Attributes to Return',
	description: string = 'Select which attributes to return for the transaction',
): INodeProperties => ({
	displayName,
	name: 'transactionAttributes',
	type: 'multiOptions',
	placeholder: 'Add Transaction Attributes',
	displayOptions: {
		show: {
			[PROPERTY_NAMES.RESOURCE]: [resource],
			[PROPERTY_NAMES.OPERATION]: [operation],
			[PROPERTY_NAMES.INCLUDE_OPTIONS]: includeOptionsValues,
		},
	},
	default: ['state', 'lastTransition'],
	options: [
		{
			name: 'Created At',
			value: 'createdAt',
			description: 'Date and time the transaction was created',
		},
		{ name: 'Customer', value: 'customer', description: 'Transaction customer' },
		{ name: 'Last Transition', value: 'lastTransition', description: 'Last state transition' },
		{
			name: 'Last Transitioned At',
			value: 'lastTransitionedAt',
			description: 'Time of last transition',
		},
		{ name: 'Line Items', value: 'lineItems', description: 'Transaction line items' },
		{ name: 'Metadata', value: 'metadata', description: 'Transaction metadata' },
		{ name: 'Payin Total', value: 'payinTotal', description: 'Amount paid by the customer' },
		{ name: 'Payout Total', value: 'payoutTotal', description: 'Amount paid to the provider' },
		{ name: 'Process Name', value: 'processName', description: 'Transaction process name' },
		{
			name: 'Process Version',
			value: 'processVersion',
			description: 'Transaction process version',
		},
		{ name: 'Protected Data', value: 'protectedData', description: "Transaction's protected data" },
		{ name: 'Provider', value: 'provider', description: 'Transaction provider' },
		{
			name: 'State',
			value: 'state',
			description: 'Transaction state, determined by last transition',
		},
		{ name: 'Transitions', value: 'transitions', description: "Transaction's transition history" },
	],
	description,
});

// ===================================
// Result Mode Fields (Query Operations)
// ===================================

/**
 * Creates result mode fields for controlling query result limits
 *
 * @param resource - The UI resource type (e.g., UI_RESOURCES.USER)
 * @param operation - The UI operation type (e.g., UI_OPERATIONS.GET_MANY)
 * @param resourceLabel - Human-readable resource name for descriptions (e.g., 'user', 'listing')
 * @param additionalNotes - Optional additional description for the "Return All" option
 * @returns Array of INodeProperties for result mode selection and limit input
 *
 * @example
 * ```typescript
 * createResultModeFields(UI_RESOURCES.USER, UI_OPERATIONS.GET_MANY, 'user')
 * createResultModeFields(UI_RESOURCES.STOCK, UI_OPERATIONS.GET_MANY, 'stock adjustment', '(max 100)')
 * ```
 */
export const createResultModeFields = (
	resource: UiResource,
	operation: UiOperation,
	resourceLabel: string,
	additionalNotes?: string,
): INodeProperties[] => [
	{
		displayName: 'Raw Response',
		name: 'rawResponse',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				[PROPERTY_NAMES.RESOURCE]: [resource],
				[PROPERTY_NAMES.OPERATION]: [operation],
			},
		},

		description:
			"Whether to return the unprocessed API response without normalization (includes metadata, pagination info, etc.). <br><br>Only 'Manual Pagination' is available with 'Raw 'Response'.",
	},
	{
		displayName: 'Limit Results',
		name: PROPERTY_NAMES.RESULT_MODE,
		type: 'options',
		default: 'totals',
		displayOptions: {
			show: {
				[PROPERTY_NAMES.RESOURCE]: [resource],
				[PROPERTY_NAMES.OPERATION]: [operation],
			},
		},
		options: [
			{
				name: 'Return All',
				value: 'returnAll',
				description: additionalNotes
					? `Return all matching ${resourceLabel}s ${additionalNotes}`
					: `Return all matching ${resourceLabel}s`,
				displayOptions: { hide: { rawResponse: [{ _cnd: { eq: true } }] } },
			},
			{
				name: 'Max Count',
				value: 'limit',
				description: `Return max number of ${resourceLabel}s`,
				displayOptions: { hide: { rawResponse: [{ _cnd: { eq: true } }] } },
			},
			{
				name: 'Manual Pagination',
				value: 'manualPagination',
				description: 'Set <code>pageSize</code> and <code>pageNumber</code> for batch processing',
			},
			{
				name: 'Total Only',
				value: 'totals',
				description: 'Return only the total count',
				displayOptions: { hide: { rawResponse: [{ _cnd: { eq: true } }] } },
			},
		],
		description: 'How many results to return',
	},
	{
		displayName: 'Max Results',
		name: 'limit',
		type: 'number',
		typeOptions: {
			minValue: 1,
			numberPrecision: 0,
		},
		displayOptions: {
			show: {
				[PROPERTY_NAMES.RESOURCE]: [resource],
				[PROPERTY_NAMES.OPERATION]: [operation],
				[PROPERTY_NAMES.RESULT_MODE]: [RESULT_MODES.LIMIT],
			},
		},
		// eslint-disable-next-line n8n-nodes-base/node-param-default-wrong-for-limit
		default: 10,
		description: 'Max number of results to return',
	},
	{
		displayName: 'Page Size',
		name: 'pageSize',
		type: 'number',
		typeOptions: {
			minValue: 1,
			maxValue: 100,
			numberPrecision: 0,
		},
		displayOptions: {
			show: {
				[PROPERTY_NAMES.RESOURCE]: [resource],
				[PROPERTY_NAMES.OPERATION]: [operation],
				[PROPERTY_NAMES.RESULT_MODE]: ['manualPagination'],
			},
		},
		default: 10,
		description: 'Number of results per page (max 100)',
	},
	{
		displayName: 'Page Number',
		name: 'pageNumber',
		type: 'number',
		typeOptions: {
			minValue: 1,
			numberPrecision: 0,
		},
		displayOptions: {
			show: {
				[PROPERTY_NAMES.RESOURCE]: [resource],
				[PROPERTY_NAMES.OPERATION]: [operation],
				[PROPERTY_NAMES.RESULT_MODE]: ['manualPagination'],
			},
		},
		default: 1,
		description: 'Page number to retrieve (starts at 1)',
	},
];

// ===================================
// Filter/Sort Field Generators
// ===================================

/**
 * Creates a condition type field for filtering extended data attributes
 *
 * @param includeRange - Whether to include range condition option (default: true)
 * @returns INodeProperties for condition type selection (equals, has, range)
 *
 * @example
 * ```typescript
 * createFilterConditionTypeField() // Includes range option
 * createFilterConditionTypeField(false) // Excludes range option
 * ```
 */
export function createFilterConditionTypeField(includeRange: boolean = true): INodeProperties {
	const options: Array<{ name: string; value: string; hint?: string; description?: string }> = [
		{
			name: 'Equals',
			value: 'eq',
			description: 'Exact match - works for numbers, booleans, and enums',
		},
		{
			name: 'Greater Than or Equal',
			value: 'gteq',
			description: 'For numeric (long) fields only',
		},
		{
			name: 'Has All',
			value: 'hasAll',
			description: 'For enum fields only - comma-separated list (must match all values)',
		},
		{
			name: 'Has Any',
			value: 'hasAny',
			description: 'For enum fields only - comma-separated list (must match at least one value)',
		},
		{
			name: 'Less Than',
			value: 'lt',
			description: 'For numeric (long) fields only',
		},
	];

	if (includeRange) {
		options.push({
			name: 'Range',
			value: 'range',
			description: 'For numeric (long) fields only - specify min and max values',
		});
	}

	return {
		displayName: 'Condition',
		name: PROPERTY_NAMES.CONDITION_TYPE,
		type: 'options',
		options,
		default: 'eq',
		description: 'Condition the attribute must meet to be included in results',
	};
}

// ===================================
// Resource Attribute Constants & Helpers
// ===================================

/**
 * User attribute field mapping (UI field name → API field path)
 */
export const USER_ATTRIBUTE_FIELD_MAP: Record<string, string> = {
	firstName: 'profile.firstName',
	lastName: 'profile.lastName',
	displayName: 'profile.displayName',
	abbreviatedName: 'profile.abbreviatedName',
	bio: 'profile.bio',
	publicData: 'profile.publicData',
	protectedData: 'profile.protectedData',
	privateData: 'profile.privateData',
	email: 'email',
	emailVerified: 'emailVerified',
	createdAt: 'createdAt',
	state: 'state',
	profileImage: 'profileImage',
};

/**
 * Listing attribute keys
 */
export const LISTING_ATTRIBUTE_KEYS = [
	'availabilityPlan',
	'createdAt',
	'currentStock',
	'description',
	'geolocation',
	'marketplace',
	'metadata',
	'price',
	'privateData',
	'publicData',
	'publicData.categoryLevel1',
	'publicData.categoryLevel2',
	'publicData.categoryLevel3',
	'state',
	'title',
];

/**
 * Transaction attribute keys
 */
export const TRANSACTION_ATTRIBUTE_KEYS = [
	'createdAt',
	'lastTransition',
	'lastTransitionedAt',
	'lineItems',
	'metadata',
	'payinTotal',
	'payoutTotal',
	'processName',
	'processVersion',
	'protectedData',
	'state',
	'transitions',
];

/**
 * Gets API query parameter prefix for extended data field type
 *
 * @param fieldType - The extended data type (metadata, publicData, privateData, protectedData)
 * @returns The corresponding API query parameter prefix
 *
 * @example
 * ```typescript
 * getExtendedDataPrefix(EXTENDED_DATA_TYPES.PUBLIC_DATA) // Returns 'pub_'
 * getExtendedDataPrefix(EXTENDED_DATA_TYPES.METADATA) // Returns 'meta_'
 * ```
 */
export function getExtendedDataPrefix(fieldType: ExtendedDataType): string {
	switch (fieldType) {
		case EXTENDED_DATA_TYPES.METADATA:
			return EXTENDED_DATA_PREFIXES[EXTENDED_DATA_TYPES.METADATA];
		case EXTENDED_DATA_TYPES.PRIVATE_DATA:
			return EXTENDED_DATA_PREFIXES[EXTENDED_DATA_TYPES.PRIVATE_DATA];
		case EXTENDED_DATA_TYPES.PROTECTED_DATA:
			return EXTENDED_DATA_PREFIXES[EXTENDED_DATA_TYPES.PROTECTED_DATA];
		case EXTENDED_DATA_TYPES.PUBLIC_DATA:
		default:
			return EXTENDED_DATA_PREFIXES[EXTENDED_DATA_TYPES.PUBLIC_DATA];
	}
}

/**
 * Extracts value from resource locator (handles string, list mode, name mode)
 */
export function getResourceLocatorValue(resourceLocator: unknown): string {
	if (!resourceLocator) return '';
	if (typeof resourceLocator === 'string') return resourceLocator;
	const obj = resourceLocator as { mode?: string; value?: string | string[] } | undefined;
	if (obj?.mode === 'list') {
		return Array.isArray(obj.value) ? obj.value.join(',') : obj.value || '';
	}
	if (obj?.mode === 'name') {
		return (obj.value as string) || '';
	}
	return '';
}

/**
 * Builds fields.{type} parameter from selected attributes
 */
export function buildSparseFieldsList(includeOptions: string[], attributeKeys: string[]): string {
	const selectedAttributes = includeOptions.filter((key) => attributeKeys.includes(key));
	if (selectedAttributes.length > 0) {
		return ['id', ...selectedAttributes].join(',');
	}
	return 'id';
}

// ===================================
// Query Parameter Building
// ===================================

/**
 * Add user attributes to query string for relationships
 */
export function addUserAttributesToQueryString(
	context: IExecuteFunctions | ILoadOptionsFunctions,
	qs: IDataObject,
	includeOptions: string[],
	relationshipKey: string,
	resource: UiResource,
	operation: string,
	index: number = 0,
): void {
	if (includeOptions.includes(relationshipKey)) {
		const userAttributes = context.getNodeParameter(
			`userAttributes_${resource}_${operation}`,
			index,
			[],
		) as string[];
		if (userAttributes.length > 0) {
			const mappedAttributes = userAttributes.map((attr) => USER_ATTRIBUTE_FIELD_MAP[attr] || attr);
			qs[QUERY_PARAMS.FIELDS_USER] = ['id', ...mappedAttributes].join(',');
		} else {
			qs[QUERY_PARAMS.FIELDS_USER] = 'id';
		}
	}
}

export const buildIncludeAndFieldsParams = (
	includeOptions: string[],
	resource: ApiResource,
): { include?: string; [key: string]: string | undefined } => {
	const qs: { include?: string; [key: string]: string | undefined } = {};

	if (!Array.isArray(includeOptions)) {
		return qs;
	}

	// Build relationships (include) based on resource type
	const relationshipKeys =
		resource === 'listing'
			? ['author', 'images', 'marketplace', 'currentStock']
			: resource === 'transaction'
				? ['customer', 'provider', 'listing', 'booking', 'reviews', 'messages']
				: resource === 'stockAdjustment'
					? [
							'listing',
							'listing.currentStock',
							'listing.author',
							'transaction',
							'transaction.customer',
							'transaction.provider',
						]
					: ['marketplace', 'profileImage', 'stripeAccount', 'effectivePermissionSet'];

	const relationships = includeOptions.filter((key) => relationshipKeys.includes(key));

	if (relationships.length > 0) {
		qs[QUERY_PARAMS.INCLUDE] = relationships.join(',');
	}

	// Build attributes based on resource type
	if (resource === 'user') {
		const attributeKeys = [
			'abbreviatedName',
			'bio',
			'categories',
			'createdAt',
			'deleted',
			'displayName',
			'email',
			'emailVerified',
			'firstName',
			'identityProviders',
			'lastName',
			'metadata',
			'pendingEmail',
			'privateData',
			'protectedData',
			'publicData',
			'state',
			'stripeConnected',
		];
		const selectedAttributes = includeOptions.filter((key) => attributeKeys.includes(key));

		if (selectedAttributes.length > 0) {
			const sparseAttributes = sparseAttributesFromNodeParameter(selectedAttributes);
			if (sparseAttributes) {
				qs[QUERY_PARAMS.FIELDS_USER] = sparseAttributes.join(',');
			}
		}
	} else if (resource === 'listing') {
		const attributeKeys = [
			'availabilityPlan',
			'categories',
			'createdAt',
			'currentStock',
			'description',
			'geolocation',
			'marketplace',
			'metadata',
			'price',
			'privateData',
			'publicData',
			'state',
			'title',
		];
		const selectedAttributes = includeOptions.filter((key) => attributeKeys.includes(key));

		if (selectedAttributes.length > 0) {
			const sparseAttributes = sparseListingAttributesFromNodeParameter(selectedAttributes);
			if (sparseAttributes) {
				qs[QUERY_PARAMS.FIELDS_LISTING] = sparseAttributes.join(',');
			}
		}
	} else if (resource === 'transaction') {
		const attributeKeys = [
			'createdAt',
			'lastTransition',
			'lastTransitionedAt',
			'lineItems',
			'metadata',
			'processName',
			'processVersion',
		];
		const selectedAttributes = includeOptions.filter((key) => attributeKeys.includes(key));

		if (selectedAttributes.length > 0) {
			const sparseAttributes = sparseTransactionAttributesFromNodeParameter(selectedAttributes);
			if (sparseAttributes) {
				qs[QUERY_PARAMS.FIELDS_TRANSACTION] = sparseAttributes.join(',');
			}
		}
	} else if (resource === 'stockAdjustment') {
		const attributeKeys = ['at', 'quantity'];
		const selectedAttributes = includeOptions.filter((key) => attributeKeys.includes(key));

		if (selectedAttributes.length > 0) {
			const sparseAttributes = sparseTransactionAttributesFromNodeParameter(selectedAttributes);
			if (sparseAttributes) {
				qs[QUERY_PARAMS.FIELDS_STOCK_ADJUSTMENT] = sparseAttributes.join(',');
			}
		}
	}

	const attributeKeys = [
		'abbreviatedName',
		'bio',
		'createdAt',
		'deleted',
		'displayName',
		'email',
		'emailVerified',
		'firstName',
		'identityProviders',
		'lastName',
		'metadata',
		'pendingEmail',
		'privateData',
		'protectedData',
		'publicData',
		'state',
		'stripeConnected',
	];
	const selectedAttributes = includeOptions.filter((key) => attributeKeys.includes(key));

	if (selectedAttributes.length > 0) {
		const sparseAttributes = sparseAttributesFromNodeParameter(selectedAttributes);
		if (sparseAttributes) {
			qs[QUERY_PARAMS.FIELDS_USER] = sparseAttributes.join(',');
		}
	}
	return qs;
};

export const sparseAttributesFromNodeParameter = (
	attributesToReturn: string[],
): string[] | null => {
	const sparseAttributes = ['id'];

	if (Array.isArray(attributesToReturn) && attributesToReturn.length) {
		const FIELD_MAP: Record<string, string> = {
			// base attributes
			deleted: 'deleted',
			state: 'state',
			createdAt: 'createdAt',
			email: 'email',
			emailVerified: 'emailVerified',
			identityProviders: 'identityProviders',
			metadata: 'metadata',
			pendingEmail: 'pendingEmail',
			stripeConnected: 'stripeConnected',
			// profile attributes
			firstName: 'profile.firstName',
			lastName: 'profile.lastName',
			displayName: 'profile.displayName',
			abbreviatedName: 'profile.abbreviatedName',
			bio: 'profile.bio',
			publicData: 'profile.publicData',
			protectedData: 'profile.protectedData',
			privateData: 'profile.privateData',
		};

		const mapped =
			attributesToReturn.map((k) => FIELD_MAP[k]).filter((v): v is string => Boolean(v)) ?? [];

		if (mapped.length) {
			sparseAttributes.push(...mapped);
		}
	}
	return sparseAttributes;
};

export const sparseListingAttributesFromNodeParameter = (
	attributesToReturn: string[],
): string[] | null => {
	const sparseAttributes = ['id'];

	if (Array.isArray(attributesToReturn) && attributesToReturn.length) {
		const FIELD_MAP: Record<string, string> = {
			// base attributes
			availabilityPlan: 'availabilityPlan',
			categories: 'categories',
			createdAt: 'createdAt',
			currentStock: 'currentStock',
			description: 'description',
			geolocation: 'geolocation',
			marketplace: 'marketplace',
			metadata: 'metadata',
			price: 'price',
			privateData: 'privateData',
			publicData: 'publicData',
			state: 'state',
			title: 'title',
		};

		let mapped =
			attributesToReturn.map((k) => FIELD_MAP[k]).filter((v): v is string => Boolean(v)) ?? [];
		if (attributesToReturn.includes('categories')) {
			mapped = mapped.filter((field) => field !== 'categories');
			mapped.push(
				...['publicData.categoryLevel1', 'publicData.categoryLevel2', 'publicData.categoryLevel3'],
			);
		}
		if (mapped.length) {
			sparseAttributes.push(...mapped);
		}
	}
	return sparseAttributes;
};

export const sparseTransactionAttributesFromNodeParameter = (
	attributesToReturn: string[],
): string[] | null => {
	const sparseAttributes = ['id'];

	if (Array.isArray(attributesToReturn) && attributesToReturn.length) {
		const FIELD_MAP: Record<string, string> = {
			// base attributes
			createdAt: 'createdAt',
			lastTransition: 'lastTransition',
			lastTransitionedAt: 'lastTransitionedAt',
			lineItems: 'lineItems',
			metadata: 'metadata',
			processName: 'processName',
			processVersion: 'processVersion',
		};

		const mapped =
			attributesToReturn.map((k) => FIELD_MAP[k]).filter((v): v is string => Boolean(v)) ?? [];

		if (mapped.length) {
			sparseAttributes.push(...mapped);
		}
	}
	return sparseAttributes;
};

// ===================================
// Response Normalization
// ===================================

/**
 * Normalizes Sharetribe API response format to flatten the data structure.
 * Converts nested {data: {id, type, attributes, relationships}} format to flat objects.
 * Also processes included relationships and embeds them into the main data.
 *
 * @param responseData - Raw response from Sharetribe API (JSON:API format or raw array/object)
 * @returns Array of normalized data objects with id, type, and flattened attributes
 */
export const normalizeSharetribeResponse = (
	responseData: SharetribeApiResponseType | IDataObject[] | IDataObject,
): IDataObject[] => {
	// Handle array responses (raw data arrays from aggregated pagination)
	if (Array.isArray(responseData)) {
		return responseData.map((item) => normalizeSharetribeItem(item, []));
	}

	// Handle object responses with JSON:API structure
	if (responseData && typeof responseData === 'object') {
		const included = (responseData as SharetribeApiResponseType).included || [];

		if ('data' in responseData && responseData.data) {
			if (Array.isArray(responseData.data)) {
				return responseData.data.map((item) =>
					normalizeSharetribeItem(item as SharetribeResource | IDataObject, included),
				);
			} else {
				return [
					normalizeSharetribeItem(responseData.data as SharetribeResource | IDataObject, included),
				];
			}
		}

		// Handle single resource without data wrapper (edge case)
		if ('id' in responseData && 'type' in responseData) {
			return [normalizeSharetribeItem(responseData as unknown as SharetribeResource, included)];
		}
	}

	return [responseData as IDataObject];
};

/**
 * Normalizes a single Sharetribe item and resolves included relationships.
 * Flattens the structure by moving attributes to root level and resolving
 * relationship references to actual included data.
 *
 * @param item - Single resource from Sharetribe API (JSON:API resource object)
 * @param included - Array of included relationship objects
 * @returns Normalized flat object
 */
const normalizeSharetribeItem = (
	item: SharetribeResource | IDataObject,
	included: SharetribeResource[] | IDataObject[] = [],
): IDataObject => {
	if (!item || typeof item !== 'object') {
		return item as IDataObject;
	}

	// Handle nested data wrapper (when item has a 'data' property that is also a resource)
	if ('data' in item && item.data && typeof item.data === 'object') {
		return normalizeSharetribeItem(item.data as SharetribeResource | IDataObject, included);
	}

	const normalized: IDataObject = {};

	// Always include id and type at root level
	if ('id' in item && item.id) {
		normalized.id = item.id;
	}

	if ('type' in item && item.type) {
		normalized.type = item.type;
	}

	// Flatten attributes to root level
	if ('attributes' in item && item.attributes && typeof item.attributes === 'object') {
		Object.assign(normalized, item.attributes);
	}

	// Process relationships - resolve references to included data
	if ('relationships' in item && item.relationships && typeof item.relationships === 'object') {
		for (const [relationshipKey, relationshipValue] of Object.entries(item.relationships)) {
			if (relationshipValue && typeof relationshipValue === 'object') {
				const relData = (relationshipValue as IDataObject).data;

				if (relData) {
					if (Array.isArray(relData)) {
						// Handle array relationships
						normalized[relationshipKey] = relData.map((ref) =>
							findAndNormalizeIncluded(ref as SharetribeResource | IDataObject, included),
						);
					} else {
						// Handle single relationship
						normalized[relationshipKey] = findAndNormalizeIncluded(
							relData as SharetribeResource | IDataObject,
							included,
						);
					}
				}
			}
		}
	}

	return normalized;
};

/**
 * Finds an included item by id and type, then normalizes it.
 * If not found in included array, returns the reference as-is.
 *
 * @param reference - Resource identifier with id and type
 * @param included - Array of included resources to search
 * @returns Normalized included object or original reference
 */
const findAndNormalizeIncluded = (
	reference: SharetribeResource | IDataObject,
	included: SharetribeResource[] | IDataObject[],
): IDataObject => {
	if (!reference || typeof reference !== 'object') {
		return reference as IDataObject;
	}

	if (!('id' in reference) || !('type' in reference)) {
		return reference;
	}

	// Find the matching included item
	const includedItem = included.find(
		(item) =>
			'id' in item && 'type' in item && item.id === reference.id && item.type === reference.type,
	);

	if (includedItem) {
		// Recursively normalize the included item (without further includes to avoid cycles)
		return normalizeSharetribeItem(includedItem, []);
	}

	// Return reference if not found in included (cast to IDataObject for compatibility)
	return reference as IDataObject;
};

// ===================================
// Date/Time Helpers
// ===================================

/**
 * Converts any datetime input to UTC ISO8601 format required by Sharetribe API.
 * Handles various input formats and timezones, ensuring the output is always in UTC.
 *
 * @param datetime - The datetime value (string, Date object, or moment object)
 * @returns UTC ISO8601 string with Z designator (e.g., "2025-01-15T10:30:00.000Z")
 *
 * @example
 * ```typescript
 * const start = this.getNodeParameter('start', index) as string;
 * const utcStart = convertToUtcIso8601(start);
 * // "2025-01-15T14:30:00-05:00" becomes "2025-01-15T19:30:00.000Z"
 * ```
 */
export function convertToUtcIso8601(datetime: string | Date | Moment): string {
	return moment.utc(datetime).toISOString();
}

// ===================================
// Validation Helpers
// ===================================

/**
 * Validates that end time is after start time and throws a NodeOperationError if not.
 *
 * This is used for operations that accept time ranges (availability exceptions, stock adjustments)
 * to ensure the time range is valid before making API requests.
 *
 * @param context - The n8n execution context (IExecuteFunctions)
 * @param itemIndex - The item index from the node execution (used for error context)
 * @param start - The start date/time string (ISO 8601 format)
 * @param end - The end date/time string (ISO 8601 format)
 * @param resourceName - Human-readable resource name for error messages (e.g., 'availability exception', 'stock adjustment')
 * @throws NodeOperationError if end time is not after start time
 *
 * @example
 * ```typescript
 * const start = this.getNodeParameter('start', index) as string;
 * const end = this.getNodeParameter('end', index) as string;
 * validateStartEndTimes(this, index, start, end, 'availability exception');
 * ```
 */
export function validateStartEndTimes(
	context: IExecuteFunctions,
	itemIndex: number,
	start: string,
	end: string,
	resourceName: string,
): void {
	const startDate = new Date(start);
	const endDate = new Date(end);

	if (endDate <= startDate) {
		throw new NodeOperationError(context.getNode(), `Invalid time range for ${resourceName}`, {
			itemIndex,
			description: `End time must be after start time.<br><br>Received start: ${start}<br>Received end: ${end}`,
		});
	}
}

/**
 * Validates that a number is a non-negative integer.
 *
 * This is commonly used for stock quantities, seat counts, and other discrete quantities
 * that cannot be negative or fractional.
 *
 * @param context - The n8n execution context (IExecuteFunctions)
 * @param itemIndex - The item index from the node execution (used for error context)
 * @param value - The number to validate
 * @param fieldName - Human-readable field name for error messages (e.g., 'quantity', 'seats', 'stock')
 * @throws NodeOperationError if value is negative or not an integer
 *
 * @example
 * ```typescript
 * const seats = this.getNodeParameter('seats', index) as number;
 * validatePositiveInteger(this, index, seats, 'seats');
 * ```
 */
export function validatePositiveInteger(
	context: IExecuteFunctions,
	itemIndex: number,
	value: number,
	fieldName: string,
): void {
	if (value < 0) {
		throw new NodeOperationError(context.getNode(), `Invalid ${fieldName} value`, {
			itemIndex,
			description: `${fieldName} cannot be negative.<br><br>Received: ${value}<br>Expected: 0 or greater`,
		});
	}
	if (!Number.isInteger(value)) {
		throw new NodeOperationError(context.getNode(), `Invalid ${fieldName} value`, {
			itemIndex,
			description: `${fieldName} must be a whole number (no decimals).<br><br>Received: ${value}`,
		});
	}
}

/**
 * Validates that a number is an integer (can be positive, negative, or zero).
 *
 * This is used for quantities that can be negative (like stock adjustments)
 * but must be whole numbers.
 *
 * @param context - The n8n execution context (IExecuteFunctions)
 * @param itemIndex - The item index from the node execution (used for error context)
 * @param value - The number to validate
 * @param fieldName - Human-readable field name for error messages (e.g., 'quantity adjustment')
 * @throws NodeOperationError if value is not an integer
 *
 * @example
 * ```typescript
 * const quantity = this.getNodeParameter('quantity', index) as number;
 * validateInteger(this, index, quantity, 'quantity');
 * ```
 */
export function validateInteger(
	context: IExecuteFunctions,
	itemIndex: number,
	value: number,
	fieldName: string,
): void {
	if (!Number.isInteger(value)) {
		throw new NodeOperationError(context.getNode(), `Invalid ${fieldName} value`, {
			itemIndex,
			description: `${fieldName} must be a whole number (no decimals).<br><br>Received: ${value}`,
		});
	}
}

/**
 * Validates that a stock adjustment quantity is non-zero.
 * According to Sharetribe API: "It is not possible to create stock adjustments with 0 quantity"
 *
 * @param context - The n8n execution context
 * @param itemIndex - The item index for error context
 * @param quantity - The adjustment quantity to validate
 * @throws NodeOperationError if quantity is 0
 */
export function validateStockAdjustmentQuantity(
	context: IExecuteFunctions,
	itemIndex: number,
	quantity: number,
): void {
	validateInteger(context, itemIndex, quantity, 'adjustment quantity');

	if (quantity === 0) {
		throw new NodeOperationError(context.getNode(), 'Invalid stock adjustment quantity', {
			itemIndex,
			description:
				'Stock adjustment quantity cannot be 0.<br><br>Use a positive number to increase stock or a negative number to decrease stock.<br><br>Note: Stock adjustments with 0 quantity are not allowed by the Sharetribe API.',
		});
	}
}

/**
 * Validates time range for stock adjustments query.
 * According to Sharetribe API:
 * - Start time must be between 366 days in the past and 1 day in the future
 * - End time must be after start time and at most 1 day in the future
 * - End time must be at most 366 days from start time
 *
 * @param context - The n8n execution context
 * @param itemIndex - The item index for error context
 * @param start - Start timestamp (ISO 8601)
 * @param end - End timestamp (ISO 8601)
 */
export function validateStockAdjustmentTimeRange(
	context: IExecuteFunctions,
	itemIndex: number,
	start: string,
	end: string,
): void {
	const startMoment = moment.utc(start);
	const endMoment = moment.utc(end);

	// Validate start is between 366 days past and 1 day future
	const past366Days = moment.utc().subtract(366, 'days');
	const future1Day = moment.utc().add(1, 'day');

	if (startMoment.isBefore(past366Days) || startMoment.isAfter(future1Day)) {
		const allowedRange = `${past366Days.format('YYYY-MM-DD HH:mm:ss')} to ${future1Day.format('YYYY-MM-DD HH:mm:ss')} UTC`;
		throw new NodeOperationError(
			context.getNode(),
			'Invalid start time for stock adjustments query',
			{
				itemIndex,
				description: `Start time must be between 366 days in the past and 1 day in the future.<br><br>Received: ${startMoment.format('YYYY-MM-DD HH:mm:ss')} UTC<br>Allowed range: ${allowedRange}`,
			},
		);
	}

	// Validate end is after start
	if (endMoment.isSameOrBefore(startMoment)) {
		throw new NodeOperationError(
			context.getNode(),
			'Invalid time range: End time must be after start time',
			{
				itemIndex,
				description: `Start: ${startMoment.format('YYYY-MM-DD HH:mm:ss')} UTC<br>End: ${endMoment.format('YYYY-MM-DD HH:mm:ss')} UTC<br><br>The end time must be later than the start time.`,
			},
		);
	}

	// Validate end is at most 1 day in future
	if (endMoment.isAfter(future1Day)) {
		throw new NodeOperationError(
			context.getNode(),
			'Invalid end time for stock adjustments query',
			{
				itemIndex,
				description: `End time must be at most 1 day in the future.<br><br>Received: ${endMoment.format('YYYY-MM-DD HH:mm:ss')} UTC<br>Maximum allowed: ${future1Day.format('YYYY-MM-DD HH:mm:ss')} UTC`,
			},
		);
	}

	// Validate end is at most 366 days from start
	const max366DaysFromStart = moment.utc(startMoment).add(366, 'days');

	if (endMoment.isAfter(max366DaysFromStart)) {
		throw new NodeOperationError(
			context.getNode(),
			'Time range too large: Maximum 366 days allowed',
			{
				itemIndex,
				description: `The time range between start and end cannot exceed 366 days.<br><br>Start: ${startMoment.format('YYYY-MM-DD HH:mm:ss')} UTC<br>End: ${endMoment.format('YYYY-MM-DD HH:mm:ss')} UTC<br>Range: ${endMoment.diff(startMoment, 'days')} days<br><br>Maximum allowed: 366 days`,
			},
		);
	}
}

/**
 * Validates time range for availability exceptions query.
 * According to Sharetribe API:
 * - Start and end must be between 366 days in the past and 366 days in the future
 * - End must be after start
 * - End must be at most 366 days after start
 *
 * @param context - The n8n execution context
 * @param itemIndex - The item index for error context
 * @param start - Start moment object (will be converted to UTC ISO8601)
 * @param end - End moment object (will be converted to UTC ISO8601)
 */
export function validateAvailabilityExceptionTimeRange(
	context: IExecuteFunctions,
	itemIndex: number,
	start: Moment,
	end: Moment,
): void {
	const startMoment = moment.utc(start);
	const endMoment = moment.utc(end);

	// Validate times are between 366 days past and 366 days future
	const past366Days = moment.utc().subtract(366, 'days');
	const future366Days = moment.utc().add(366, 'days');

	if (startMoment.isBefore(past366Days) || startMoment.isAfter(future366Days)) {
		const allowedRange = `${past366Days.format('YYYY-MM-DD HH:mm:ss')} to ${future366Days.format('YYYY-MM-DD HH:mm:ss')} UTC`;
		throw new NodeOperationError(
			context.getNode(),
			'Invalid start time for availability exception',
			{
				itemIndex,
				description: `Start time must be between 366 days in the past and 366 days in the future.<br><br>Received: ${startMoment.format('YYYY-MM-DD HH:mm:ss')} UTC<br>Allowed range: ${allowedRange}`,
			},
		);
	}

	if (endMoment.isBefore(past366Days) || endMoment.isAfter(future366Days)) {
		const allowedRange = `${past366Days.format('YYYY-MM-DD HH:mm:ss')} to ${future366Days.format('YYYY-MM-DD HH:mm:ss')} UTC`;
		throw new NodeOperationError(context.getNode(), 'Invalid end time for availability exception', {
			itemIndex,
			description: `End time must be between 366 days in the past and 366 days in the future.<br><br>Received: ${endMoment.format('YYYY-MM-DD HH:mm:ss')} UTC<br>Allowed range: ${allowedRange}`,
		});
	}

	// Validate end is after start
	if (endMoment.isSameOrBefore(startMoment)) {
		throw new NodeOperationError(context.getNode(), 'End time must be after start time', {
			itemIndex,
			description: `End time must be later than start time.<br><br>Received start: ${startMoment.format('YYYY-MM-DD HH:mm:ss')} UTC<br>Received end: ${endMoment.format('YYYY-MM-DD HH:mm:ss')} UTC`,
		});
	}

	// Validate end is at most 366 days from start
	const max366DaysFromStart = moment.utc(startMoment).add(366, 'days');

	if (endMoment.isAfter(max366DaysFromStart)) {
		const rangeInDays = endMoment.diff(startMoment, 'days');
		throw new NodeOperationError(context.getNode(), 'Time range exceeds maximum allowed duration', {
			itemIndex,
			description: `The time range between start and end cannot exceed 366 days.<br><br>Received start: ${startMoment.format('YYYY-MM-DD HH:mm:ss')} UTC<br>Received end: ${endMoment.format('YYYY-MM-DD HH:mm:ss')} UTC<br>Range: ${rangeInDays} days<br><br>Maximum allowed: 366 days`,
		});
	}
}

// ===================================
// Common Execute Helpers
// ===================================

/**
 * Unified execution function for ALL Sharetribe API operations.
 *
 * This is the ONLY function that ALL execute files should use. It handles:
 * - Single resource operations (get, create, update, delete, etc.)
 * - Query operations (getMany) with result modes
 * - RAW mode to return unprocessed API responses
 * - Automatic pagination for large result sets
 * - Normalized JSON:API response formatting
 *
 * @param context - The n8n execution context (IExecuteFunctions)
 * @param method - HTTP method ('GET', 'POST', 'PUT', 'DELETE', etc.)
 * @param endpoint - Sharetribe API endpoint path (e.g., 'listings/show', 'users/query')
 * @param body - Request body for POST/PUT requests (optional)
 * @param qs - URL query string parameters (optional)
 * @param itemIndex - Item index for error context (required for query operations)
 * @param resultMode - Result mode for query operations (optional: 'returnAll', 'limit', 'totals', 'raw')
 * @param limit - Maximum results for query operations (optional)
 * @param options - Additional options (maxLimit, forceLimitedQuery)
 * @returns Promise resolving to array of n8n execution data items
 *
 * @example
 * ```typescript
 * // Simple GET request (single resource)
 * return executeSharetribeRequest(this, 'GET', 'listings/show', undefined, { id: listingId, expand: true });
 *
 * // Query operation with result mode
 * return executeSharetribeRequest(this, 'GET', 'listings/query', undefined, qs, index, resultMode, limit);
 *
 * // RAW mode - returns unprocessed API response
 * return executeSharetribeRequest(this, 'GET', 'listings/query', undefined, qs, index, 'raw');
 * ```
 */
export async function executeSharetribeRequest(
	context: IExecuteFunctions,
	method: IHttpRequestMethods,
	endpoint: Endpoints,
	body?: IDataObject,
	qs?: IDataObject,
	itemIndex?: number,
	resultMode?: string,
	limit?: number,
	options?: { maxLimit?: number; forceLimitedQuery?: boolean },
): Promise<INodeExecutionData[]> {
	// Log request details for debugging
	context.logger.info(`Making ${method} request to ${endpoint}`);
	if (body && Object.keys(body).length > 0) {
		context.logger.info(`Request body: ${JSON.stringify(body, null, 2)}`);
	}
	if (qs && Object.keys(qs).length > 0) {
		context.logger.info(`Query parameters: ${JSON.stringify(qs, null, 2)}`);
	}

	// Check for manual pagination settings first (applies to both raw and normalized responses)
	let finalQs = qs || {};
	if (resultMode === RESULT_MODES.MANUAL_PAGINATION) {
		const pageSize =
			itemIndex !== undefined
				? (context.getNodeParameter('pageSize', itemIndex, 100) as number)
				: 100;
		const pageNumber =
			itemIndex !== undefined
				? (context.getNodeParameter('pageNumber', itemIndex, 1) as number)
				: 1;
		context.logger.info(`Manual pagination: pageSize=${pageSize}, pageNumber=${pageNumber}`);
		finalQs = { ...qs, perPage: pageSize, page: pageNumber };
	}

	// Check for raw response mode (separate boolean parameter)
	const rawResponse =
		itemIndex !== undefined
			? (context.getNodeParameter('rawResponse', itemIndex, false) as boolean)
			: false;
	if (rawResponse) {
		const response = await apiRequest.call(context, method, endpoint, body || {}, finalQs);
		return context.helpers.returnJsonArray([response as unknown as IDataObject]);
	}

	// If resultMode is provided, handle query operation with result modes
	if (resultMode) {
		// MANUAL_PAGINATION mode - return specific page with normalized data
		if (resultMode === RESULT_MODES.MANUAL_PAGINATION) {
			const response = await apiRequest.call(context, method, endpoint, body || {}, finalQs);
			const normalizedData = normalizeSharetribeResponse(response);
			return context.helpers.returnJsonArray(normalizedData);
		}

		// TOTALS mode - return count and pagination details
		if (resultMode === RESULT_MODES.TOTALS) {
			const totalQs = { ...qs, perPage: 10, page: 1 };
			const response = await apiRequest.call(context, method, endpoint, body || {}, totalQs);
			const totalsData = {
				totalItems: response?.meta?.totalItems || 0,
				totalPages: response?.meta?.totalPages || 0,
				page: response?.meta?.page || 1,
				perPage: response?.meta?.perPage || 1,
				paginationLimit: response?.meta?.paginationLimit,
			};
			return context.helpers.returnJsonArray([totalsData]);
		}

		// Handle forced limited query (e.g., availability queries)
		if (options?.forceLimitedQuery && resultMode === RESULT_MODES.RETURN_ALL) {
			const maxLimit = options?.maxLimit;
			const cappedLimit = maxLimit ? Math.min(limit || maxLimit, maxLimit) : limit;
			const limitedQs = { ...qs, perPage: cappedLimit || 100, page: 1 };
			const response = await apiRequest.call(context, method, endpoint, body || {}, limitedQs);
			const normalizedData = normalizeSharetribeResponse(response);
			return context.helpers.returnJsonArray(normalizedData);
		}

		// RETURN_ALL mode - paginate through all results
		if (resultMode === RESULT_MODES.RETURN_ALL || (limit && limit > 100)) {
			let page = 1;
			let hasMore = true;
			const allData: IDataObject[] = [];

			while (hasMore) {
				const paginatedQs = { ...qs, perPage: 100, page };
				const response = await apiRequest.call(context, method, endpoint, body || {}, paginatedQs);
				const normalized = normalizeSharetribeResponse(response);
				allData.push(...normalized);

				const totalPages = response?.meta?.totalPages || 1;
				hasMore = page < totalPages;
				page++;
			}

			return context.helpers.returnJsonArray(allData);
		}

		// LIMIT mode - return limited results
		const limitedQs = { ...qs, perPage: limit || 50, page: 1 };
		const response = await apiRequest.call(context, method, endpoint, body || {}, limitedQs);
		const normalizedData = normalizeSharetribeResponse(response);
		return context.helpers.returnJsonArray(normalizedData);
	}

	// No resultMode - simple single resource operation
	const response = await apiRequest.call(context, method, endpoint, body || {}, qs || {});
	const normalizedData = normalizeSharetribeResponse(response);
	return context.helpers.returnJsonArray(normalizedData);
}

/**
 * Builds include relationships and fields parameters for stock-related queries
 * Handles listing, listing.currentStock, transaction, and user relationships
 *
 * @param context - The n8n execution context
 * @param index - The current execution index
 * @param responseConfig - Array of selected response attributes
 * @param transactionPath - Path to transaction (e.g., 'transaction' or 'stockReservation.transaction')
 * @param parameterNamePrefix - Prefix for parameter names (e.g., 'stockQuery' or 'stockShowReservation')
 * @returns Object with includeRelationships array and qs (query string) object
 */
export function buildStockIncludeAndFieldsParams(
	context: IExecuteFunctions,
	index: number,
	includeOptions: string[],
	transactionPath: string,
	parameterNamePrefix: string,
): { includeRelationships: string[]; qs: IDataObject } {
	const includeRelationships: string[] = [];
	const qs: IDataObject = {};
	let needsUserAttributes = false;

	// Handle listing relationship
	if (includeOptions.includes('listing')) {
		includeRelationships.push('listing');

		const listingAttributes = context.getNodeParameter(
			`${parameterNamePrefix}ListingAttributes`,
			index,
			[],
		) as string[];
		if (listingAttributes.length > 0) {
			qs[QUERY_PARAMS.FIELDS_LISTING] = ['id', ...listingAttributes].join(',');

			// If listing author is selected, include it
			if (listingAttributes.includes('author')) {
				includeRelationships.push('listing.author');
				needsUserAttributes = true;
			}
		} else {
			qs[QUERY_PARAMS.FIELDS_LISTING] = 'id';
		}
	}

	// Handle listing.currentStock relationship
	if (includeOptions.includes('listing.currentStock')) {
		includeRelationships.push('listing.currentStock');
	}

	// Handle transaction relationship
	if (includeOptions.includes(transactionPath)) {
		includeRelationships.push(transactionPath);

		const transactionAttributes = context.getNodeParameter(
			`${parameterNamePrefix}TransactionAttributes`,
			index,
			[],
		) as string[];

		// Only include customer/provider if explicitly selected
		if (transactionAttributes.includes('customer')) {
			includeRelationships.push(`${transactionPath}.customer`);
			needsUserAttributes = true;
		}
		if (transactionAttributes.includes('provider')) {
			includeRelationships.push(`${transactionPath}.provider`);
			needsUserAttributes = true;
		}

		qs[QUERY_PARAMS.FIELDS_TRANSACTION] = buildSparseFieldsList(
			transactionAttributes,
			TRANSACTION_ATTRIBUTE_KEYS,
		);
	}

	// Handle user attributes once for all user types (author, customer, provider)
	if (needsUserAttributes) {
		const userAttributes = context.getNodeParameter(
			`${parameterNamePrefix}UserAttributes`,
			index,
			[],
		) as string[];
		if (userAttributes.length > 0) {
			const mappedAttributes = userAttributes.map((attr) => USER_ATTRIBUTE_FIELD_MAP[attr] || attr);
			qs[QUERY_PARAMS.FIELDS_USER] = ['id', ...mappedAttributes].join(',');
		}
	}

	return { includeRelationships, qs };
}

/**
 * Handles date range filtering with support for exact, range, before, and after modes
 *
 * @param filter - The filter object containing the date range configuration
 * @param fieldName - The base field name (e.g., 'bookingStart', 'bookingEnd')
 * @returns ISO 8601 formatted date string or range string, or undefined if no valid date
 */
export function handleDateRangeFilter(filter: IDataObject, fieldName: string): string | undefined {
	const rangeType = filter[`${fieldName}RangeType`] || 'exact';

	if (rangeType === 'exact' && filter[`${fieldName}Exact`]) {
		return convertToUtcIso8601(filter[`${fieldName}Exact`] as string);
	} else if (rangeType === 'range' && (filter[`${fieldName}Start`] || filter[`${fieldName}End`])) {
		const start = filter[`${fieldName}Start`]
			? convertToUtcIso8601(filter[`${fieldName}Start`] as string)
			: '';
		const end = filter[`${fieldName}End`]
			? convertToUtcIso8601(filter[`${fieldName}End`] as string)
			: '';
		return `${start},${end}`;
	} else if (rangeType === 'after' && filter[`${fieldName}Start`]) {
		return `${convertToUtcIso8601(filter[`${fieldName}Start`] as string)},`;
	} else if (rangeType === 'before' && filter[`${fieldName}End`]) {
		return `,${convertToUtcIso8601(filter[`${fieldName}End`] as string)}`;
	}

	return undefined;
}

/**
 * Handles extended data filters (metadata, publicData, privateData, protectedData)
 *
 * @param filter - The filter object
 * @param dataType - Type of extended data ('metadata', 'publicData', 'privateData', 'protectedData')
 * @param node - The n8n node (for error throwing)
 * @returns Object with filter key and value, or undefined if invalid
 */
export function handleExtendedDataFilter(
	filter: IDataObject,
	dataType: 'metadata' | 'publicData' | 'privateData' | 'protectedData',
	node: INode,
): { key: string; value: string } | undefined {
	const attributeNameField = `${dataType}AttributeName`;
	const prefix = getExtendedDataPrefix(dataType);

	if (!filter[attributeNameField] || !filter.extendedDataValue) {
		return undefined;
	}

	const key = getResourceLocatorValue(filter[attributeNameField]);
	const condition = filter.condition_type || 'eq';
	const value = filter.extendedDataValue;

	// Validate attribute name
	if (!key.trim()) {
		const dataTypeLabels = {
			metadata: 'Metadata',
			publicData: 'Public data',
			privateData: 'Private data',
			protectedData: 'Protected data',
		};
		const dataTypeLabel = dataTypeLabels[dataType] || dataType;
		throw new NodeApiError(node, {
			message: `${dataTypeLabel} attribute name cannot be empty`,
			description: 'Please provide a valid attribute name',
		} as JsonObject);
	}

	const filterKey = `${prefix}_${key}`;
	const filterValue = condition === 'eq' ? value : `${condition}:${value}`;

	return { key: filterKey, value: filterValue as string };
}

/**
 * Handles sorting for extended data fields
 *
 * @param sortRule - The sort rule object
 * @param field - The field name
 * @param direction - Sort direction ('ASC' or 'DESC')
 * @returns Formatted sort string for the API
 */
export function handleExtendedDataSort(
	sortRule: IDataObject,
	field: string,
	direction: string,
): string {
	// Sharetribe API: no prefix = descending, "-" prefix = ascending
	const prefix = direction === 'ASC' ? '-' : '';

	const extendedDataFields = ['metadata', 'privateData', 'publicData', 'protectedData'];
	if (extendedDataFields.includes(field)) {
		const keyName = getResourceLocatorValue(sortRule[`${field}AttributeName`]);
		const dataPrefix = getExtendedDataPrefix(
			field as 'metadata' | 'publicData' | 'privateData' | 'protectedData',
		);
		return `${prefix}${dataPrefix}_${keyName}`;
	}

	return `${prefix}${field}`;
}

/**
 * Processes an array of filters and applies them to a query string object
 *
 * @param filters - Array of filter objects
 * @param qs - Query string object to mutate
 * @param node - The n8n node (for error throwing)
 */
export function addFiltersToQueryParams(
	filters: IDataObject[],
	qs: IDataObject,
	node: INode,
): void {
	for (const filter of filters) {
		const filterType = filter.filterType as string;

		// Simple ID filters
		const idFilters = ['customerId', 'providerId', 'listingId', 'userId', 'authorId'];
		if (idFilters.includes(filterType) && filter[filterType]) {
			qs[filterType] = filter[filterType];
		}

		// Array filters
		if (filterType === 'bookingStates' && filter.bookingStates) {
			qs.bookingStates = (filter.bookingStates as string[]).join(',');
		}
		if (filterType === 'stockReservationStates' && filter.stockReservationStates) {
			qs.stockReservationStates = (filter.stockReservationStates as string[]).join(',');
		}
		if (filterType === 'states' && filter.states) {
			qs.states = (filter.states as string[]).join(',');
		}

		// Date filters - convert to UTC ISO8601
		if (filterType === 'createdAtStart' && filter.createdAtStartTime) {
			qs.createdAtStart = convertToUtcIso8601(filter.createdAtStartTime as string);
		}
		if (filterType === 'createdAtEnd' && filter.createdAtEndTime) {
			qs.createdAtEnd = convertToUtcIso8601(filter.createdAtEndTime as string);
		}

		// Date range filters
		if (filterType === 'bookingStart') {
			const result = handleDateRangeFilter(filter, 'bookingStart');
			if (result) qs.bookingStart = result;
		}
		if (filterType === 'bookingEnd') {
			const result = handleDateRangeFilter(filter, 'bookingEnd');
			if (result) qs.bookingEnd = result;
		}

		// Boolean filters
		const booleanFilters = ['hasBooking', 'hasMessage', 'hasPayin', 'hasStockReservation'];
		for (const boolFilter of booleanFilters) {
			if (filterType === boolFilter && typeof filter[boolFilter] === 'boolean') {
				qs[boolFilter] = filter[boolFilter].toString();
			}
		}

		// Resource locator filters
		if (filterType === 'lastTransition' && filter.lastTransitions) {
			const transitions = getResourceLocatorValue(filter.lastTransitions);
			if (transitions) qs.lastTransitions = transitions;
		}
		if (filterType === 'processNames' && filter.processNames) {
			const processNames = getResourceLocatorValue(filter.processNames);
			if (processNames) qs.processNames = processNames;
		}

		// Extended data filters
		const extendedDataTypes = ['metadata', 'privateData', 'publicData', 'protectedData'] as const;
		for (const dataType of extendedDataTypes) {
			if (filterType === dataType) {
				const result = handleExtendedDataFilter(filter, dataType, node);
				if (result) qs[result.key] = result.value;
			}
		}
	}
}

/**
 * Handles listing-specific filters
 *
 * @param filter - The filter object
 * @param qs - Query string object to mutate
 */
export function applyListingSpecificFilters(filter: IDataObject, qs: IDataObject): void {
	const filterType = filter.filterType as string;

	// Availability filter
	if (filterType === 'availability' && filter.availabilityOptions) {
		const availOptions = filter.availabilityOptions as IDataObject;
		const settings = availOptions.settings as IDataObject;

		if (settings) {
			if (settings.availabilityType) {
				qs.availability = settings.availabilityType;
			}
			if (settings.start) {
				qs.start = convertToUtcIso8601(settings.start as string);
			}
			if (settings.end) {
				qs.end = convertToUtcIso8601(settings.end as string);
			}
			if (settings.seats) {
				qs.seats = settings.seats;
			}
			if (settings.minDuration) {
				qs.minDuration = settings.minDuration;
			}
		}
	}

	// Bounds filter
	if (filterType === 'bounds' && filter.boundsNE && filter.boundsSW) {
		qs.bounds = `${filter.boundsNE},${filter.boundsSW}`;
	}

	// IDs filter
	if (filterType === 'ids' && filter.ids) {
		qs.ids = filter.ids;
	}

	// Keywords filter
	if (filterType === 'keywords' && filter.keywords) {
		qs.keywords = filter.keywords;
	}

	// Location filter
	if (filterType === 'location' && filter.origin) {
		qs.origin = filter.origin;
	}

	// Stock filter
	if (filterType === 'stock' && filter.stockOptions) {
		const stockOptions = filter.stockOptions as IDataObject;
		const settings = stockOptions.settings as IDataObject;

		if (settings) {
			if (settings.stockMode) {
				qs.stockMode = settings.stockMode;
			}
			if (settings.minStock) {
				qs.minStock = settings.minStock;
			}
		}
	}

	// Price filter with range support
	if (filterType === 'price') {
		const rangeType = filter.priceRangeType || 'exact';

		if (rangeType === 'exact' && filter.price) {
			qs.price = filter.price;
		} else if (rangeType === 'range' && (filter.priceMin || filter.priceMax)) {
			const min = filter.priceMin || '';
			const max = filter.priceMax || '';
			qs.price = `${min},${max}`;
		} else if (rangeType === 'minimum' && filter.priceMin) {
			qs.price = `${filter.priceMin},`;
		} else if (rangeType === 'maximum' && filter.priceMax) {
			qs.price = `,${filter.priceMax}`;
		}
	}

	// Category filters with resource locator support
	const categories = ['categoryLevel1', 'categoryLevel2', 'categoryLevel3'];
	for (const category of categories) {
		if (filterType === category && filter[category]) {
			const categoryValue = getResourceLocatorValue(filter[category]);
			if (categoryValue) qs[`pub_${category}`] = categoryValue;
		}
	}

	// Listing type filter
	if (filterType === 'listingType' && filter.listingType) {
		const listingTypeValue = getResourceLocatorValue(filter.listingType);
		if (listingTypeValue) qs.pub_listingType = listingTypeValue;
	}

	// Extended data filters with range support
	const extendedDataTypes = ['metadata', 'privateData', 'protectedData', 'publicData'];
	if (extendedDataTypes.includes(filterType) && filter[`${filterType}AttributeName`]) {
		const key = getResourceLocatorValue(filter[`${filterType}AttributeName`]);
		const condition = filter.condition_type || 'eq';
		const filterKey = `${getExtendedDataPrefix(filterType as ExtendedDataType)}_${key}`;

		if (condition === 'range' && (filter.extendedDataMinValue || filter.extendedDataMaxValue)) {
			const min = filter.extendedDataMinValue || '';
			const max = filter.extendedDataMaxValue || '';
			qs[filterKey] = `${min},${max}`;
		} else if (filter.extendedDataValue) {
			qs[filterKey] =
				condition === 'eq' ? filter.extendedDataValue : `${condition}:${filter.extendedDataValue}`;
		}
	}
}

/**
 * Processes sorting options and returns formatted sort string
 *
 * @param sortOptions - Sort options object containing array of sort rules
 * @returns Comma-separated sort string for the API
 */
export function formatSortParameter(sortOptions: IDataObject): string | undefined {
	if (!sortOptions.sort) {
		return undefined;
	}

	const sortArray = (sortOptions.sort as IDataObject[]).map((sortRule) => {
		const field = sortRule.field as string;
		const direction = (sortRule.direction as string) || 'ASC';

		return handleExtendedDataSort(sortRule, field, direction);
	});

	return sortArray.join(',');
}

/**
 * Extracts fields from n8n resource mapper data structure
 * Handles different resource mapper formats (value, mappingMode, direct)
 * @param parameterData - The raw parameter data from n8n
 * @param parameterName - Name of the parameter for error messages
 * @returns Extracted fields as IDataObject
 */
export function extractResourceMapperFields(
	parameterData: IDataObject,
	parameterName: string,
): IDataObject {
	if (!parameterData || typeof parameterData !== 'object') {
		throw new Error(`${parameterName} parameter is required and must be an object.`);
	}

	// Case 1: Resource mapper with 'value' property
	if ('value' in parameterData && parameterData.value && typeof parameterData.value === 'object') {
		return parameterData.value as IDataObject;
	}

	// Case 2: Resource mapper with 'mappingMode'
	if ('mappingMode' in parameterData) {
		const possibleDataKeys = Object.keys(parameterData).filter(
			(key) =>
				key !== 'mappingMode' &&
				typeof parameterData[key] === 'object' &&
				parameterData[key] !== null,
		);

		if (possibleDataKeys.length > 0) {
			return parameterData[possibleDataKeys[0]] as IDataObject;
		}

		const directFields = Object.keys(parameterData).filter(
			(key) => key !== 'mappingMode' && typeof parameterData[key] !== 'object',
		);

		if (directFields.length > 0) {
			const fields: IDataObject = {};
			directFields.forEach((key) => {
				fields[key] = parameterData[key];
			});
			return fields;
		}

		throw new Error(`No ${parameterName} were mapped. Please configure the field mapping.`);
	}

	// Case 3: Direct object mapping
	return parameterData;
}

/**
 * Filters out empty values from an object
 * Removes null, undefined, and empty strings
 */
export function removeEmptyFields(fields: IDataObject): IDataObject {
	const cleanedFields: IDataObject = {};
	Object.entries(fields).forEach(([key, value]) => {
		if (value !== '' && value !== null && value !== undefined) {
			cleanedFields[key] = value;
		}
	});
	return cleanedFields;
}

/**
 * Parses JSON string fields in an object
 * @param fields - Object containing fields to parse
 * @param jsonFieldNames - Array of field names that should be parsed as JSON
 * @returns Object with parsed JSON fields
 */
export function parseJsonFields(fields: IDataObject, jsonFieldNames: string[]): IDataObject {
	const parsedFields = { ...fields };
	for (const key of jsonFieldNames) {
		if (parsedFields[key] && typeof parsedFields[key] === 'string') {
			try {
				parsedFields[key] = JSON.parse(parsedFields[key] as string);
			} catch (err) {
				throw new Error(`Field "${key}" is not valid JSON: ${(err as Error).message}`);
			}
		}
	}
	return parsedFields;
}

/**
 * Creates an extended data attribute field with resource locator
 * Used for filtering and sorting by custom marketplace attributes
 *
 * @param dataType - The extended data type (metadata, publicData, privateData, protectedData)
 * @param filterType - The filter type identifier for display options
 * @returns INodeProperties configuration for resource locator field
 *
 * @example
 * ```typescript
 * createExtendedDataAttributeField(EXTENDED_DATA_TYPES.PUBLIC_DATA, 'publicData')
 * createExtendedDataAttributeField(EXTENDED_DATA_TYPES.METADATA, 'metadata')
 * ```
 */
export function createExtendedDataAttributeField(
	dataType: ExtendedDataType,
	filterType: string,
): INodeProperties {
	const searchMethodMap = {
		[EXTENDED_DATA_TYPES.METADATA]: LoadOptionsMethod.getMetadataAttributes,
		[EXTENDED_DATA_TYPES.PUBLIC_DATA]: LoadOptionsMethod.getPublicDataAttributes,
		[EXTENDED_DATA_TYPES.PRIVATE_DATA]: LoadOptionsMethod.getPrivateDataAttributes,
		[EXTENDED_DATA_TYPES.PROTECTED_DATA]: LoadOptionsMethod.getProtectedDataAttributes,
	};

	const placeholderMap = {
		[EXTENDED_DATA_TYPES.METADATA]: 'metadata',
		[EXTENDED_DATA_TYPES.PUBLIC_DATA]: 'public data',
		[EXTENDED_DATA_TYPES.PRIVATE_DATA]: 'private data',
		[EXTENDED_DATA_TYPES.PROTECTED_DATA]: 'protected data',
	};

	return {
		displayName: 'Attribute Name',
		name: `${dataType}AttributeName`,
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		description: `Select the ${placeholderMap[dataType]} attribute to filter by`,
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				type: 'list',
				placeholder: 'Select attribute',
				typeOptions: {
					searchListMethod: searchMethodMap[dataType],
					searchable: true,
				},
			},
			{
				displayName: 'By Name',
				name: 'name',
				type: 'string',
				placeholder: 'attributeName',
				hint: `Enter the top-level ${placeholderMap[dataType]} attribute name`,
			},
		],
		displayOptions: {
			show: { filterType: [filterType] },
		},
	};
}

/**
 * Returns common filter options that are shared across resources
 * @returns Array of filter option objects for use in filter type dropdowns
 */
export function getCommonFilterOptions() {
	return [
		{ ...COMMON_FILTER_OPTIONS.CREATED_ON_OR_AFTER },
		{ ...COMMON_FILTER_OPTIONS.CREATED_BEFORE },
		{ ...COMMON_FILTER_OPTIONS.METADATA },
		{ ...COMMON_FILTER_OPTIONS.PRIVATE_DATA },
		{ ...COMMON_FILTER_OPTIONS.PROTECTED_DATA },
		{ ...COMMON_FILTER_OPTIONS.PUBLIC_DATA },
	];
}

/**
 * Returns common sort field options that are shared across resources
 * @returns Array of sort field option objects for use in sort field dropdowns
 */
export function getCommonSortFields() {
	return [
		{ ...COMMON_SORT_FIELDS.CREATED_AT },
		{ ...COMMON_SORT_FIELDS.METADATA },
		{ ...COMMON_SORT_FIELDS.PUBLIC_DATA },
		{ ...COMMON_SORT_FIELDS.PRIVATE_DATA },
		{ ...COMMON_SORT_FIELDS.PROTECTED_DATA },
	];
}

/**
 * Returns transaction-specific filter options
 * @returns Array of transaction filter option objects
 */
export function getTransactionFilterOptions() {
	return [
		{ ...TRANSACTION_FILTER_OPTIONS.BOOKING_END },
		{ ...TRANSACTION_FILTER_OPTIONS.BOOKING_START },
		{ ...TRANSACTION_FILTER_OPTIONS.BOOKING_STATES },
		{ ...COMMON_FILTER_OPTIONS.CREATED_ON_OR_AFTER },
		{ ...COMMON_FILTER_OPTIONS.CREATED_BEFORE },
		{ ...TRANSACTION_FILTER_OPTIONS.CUSTOMER_ID },
		{ ...TRANSACTION_FILTER_OPTIONS.HAS_BOOKING },
		{ ...TRANSACTION_FILTER_OPTIONS.HAS_MESSAGE },
		{ ...TRANSACTION_FILTER_OPTIONS.HAS_PAYIN },
		{ ...TRANSACTION_FILTER_OPTIONS.HAS_STOCK_RESERVATION },
		{ ...TRANSACTION_FILTER_OPTIONS.LAST_TRANSITION },
		{ ...TRANSACTION_FILTER_OPTIONS.LISTING_ID },
		{ ...COMMON_FILTER_OPTIONS.METADATA },
		{ ...COMMON_FILTER_OPTIONS.PRIVATE_DATA },
		{ ...TRANSACTION_FILTER_OPTIONS.PROCESS_NAMES },
		{ ...COMMON_FILTER_OPTIONS.PROTECTED_DATA },
		{ ...TRANSACTION_FILTER_OPTIONS.PROVIDER_ID },
		{ ...COMMON_FILTER_OPTIONS.PUBLIC_DATA },
		{ ...TRANSACTION_FILTER_OPTIONS.STATES },
	];
}

/**
 * Returns transaction-specific sort field options
 * @returns Array of transaction sort field options
 */
export function getTransactionSortFields() {
	return [
		{ ...COMMON_SORT_FIELDS.CREATED_AT, description: 'Sort by transaction creation time' },
		{
			name: 'Last Transition At',
			value: 'lastTransitionAt',
			description: 'Sort by last transition time',
		},
		{ ...COMMON_SORT_FIELDS.METADATA, description: 'Sort by a top level metadata attribute' },
		{
			...COMMON_SORT_FIELDS.PRIVATE_DATA,
			description: 'Sort by a top level private data attribute',
		},
		{ ...COMMON_SORT_FIELDS.PUBLIC_DATA, description: 'Sort by a top level public data attribute' },
	];
}

/**
 * Returns sort direction options
 * @returns Array of sort direction options
 */
export function getSortDirectionOptions() {
	return [
		{
			name: 'Ascending',
			value: SORT_DIRECTIONS.ASCENDING,
		},
		{
			name: 'Descending',
			value: SORT_DIRECTIONS.DESCENDING,
		},
	];
}

/**
 * Generates event type fields for trigger nodes dynamically
 * Creates a field for each resource type that allows selecting which events to trigger on
 *
 * @param resources - Array of resource names (can include trigger-specific resources like 'all', 'message', 'booking', etc.)
 * @param eventTypes - Event types configuration object mapping resources to their available events
 * @returns Array of node properties for event type selection
 *
 * @example
 * ```typescript
 * createEventTypeFields(
 *   ['user', 'listing', 'transaction', 'all'],
 *   { user: [...], listing: [...], all: [...] }
 * )
 * ```
 */
export function createEventTypeFields(
	resources: string[],
	eventTypes: Record<string, Array<{ name: string; value: string }>>,
): INodeProperties[] {
	return resources.map((resource, index) => {
		const capitalized = resource.charAt(0).toUpperCase() + resource.slice(1);
		return {
			displayName: `Trigger On ${' '.repeat(index)}`, // Hack to ensure a unique display name, but not to the user.
			name: `eventTypes${capitalized}`,
			type: 'multiOptions',
			displayOptions: { show: { resource: [resource] } },
			options: eventTypes[resource] || [],
			default: [],
			required: true,
		} as INodeProperties;
	});
}

/**
 * Splits a camelCase string into separate words, separated by a space,
 * and converts the entire result to lowercase.
 * * Example: "firstNameAndLastName" -> "first name and last name"
 * @param {string} camelCaseString The string to process.
 * @returns {string} The resulting space-separated, lowercase string.
 */
function splitAndLowercaseCamelCase(camelCaseString: string): string {
	if (!camelCaseString) {
		return '';
	}

	//    - The expression /([A-Z])/g finds every uppercase letter.
	//    - The replacement ' $1' inserts a space before that uppercase letter.
	const spacedString = camelCaseString.replace(/([A-Z])/g, ' $1');

	return spacedString.toLowerCase().trim();
}

const UUID_V4_ONLY_REGEX: RegExp =
	/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
/**
 * Validates if a string is a standard UUID (v1, v4, or v5).
 * @param {string} uuidString The string to validate.
 * @returns {boolean} True if the string is a valid UUID, false otherwise.
 */
export function isValidUUID(uuidString: string): boolean {
	if (typeof uuidString !== 'string') {
		return false;
	}

	return UUID_V4_ONLY_REGEX.test(uuidString);
}

/**
 * Validates if a string is a standard UUID (v1, v4, or v5).
 * @param {string} uuidString The string to validate.
 * @returns {boolean} True if the string is a valid UUID, false otherwise.
 */
export function throwNodeErrorIfNotValidUuid(
	context: IExecuteFunctions,
	itemIndex: number,
	uuidString: string,
	resource: UiResource,
): null | NodeOperationError {
	if (isValidUUID(uuidString)) {
		return null;
	}
	const resourceName = splitAndLowercaseCamelCase(resource);
	const description = `The ${resourceName} ID '${uuidString}' is not a valid UUID`;
	throw new NodeOperationError(context.getNode(), `Invalid ${resourceName} ID`, {
		description,
		itemIndex: itemIndex,
	});
}

// ===================================
// Shared Extended Data Field Definitions
// ===================================

/**
 * Shared extended data field definitions used across all resources (listings, users, transactions)
 */

export const publicDataField: INodeProperties = {
	displayName: 'Public Data (JSON)',
	name: 'publicData',
	type: 'json',
	default: '{}',
	hint: 'Given object is merged on the top level. Nested values are set as given. Top level keys set as <code>null</code> are removed.',
	description:
		'Public data. See <a href="https://www.sharetribe.com/docs/references/extended-data/">Extended Data.</a>.',
};

export const protectedDataField: INodeProperties = {
	displayName: 'Protected Data (JSON)',
	name: 'protectedData',
	type: 'json',
	default: '{}',
	hint: 'Given object is merged on the top level. Nested values are set as given. Top level keys set as <code>null</code> are removed.',
	description:
		'Protected data. See <a href="https://www.sharetribe.com/docs/references/extended-data/">Extended Data.</a>.',
};

export const privateDataField: INodeProperties = {
	displayName: 'Private Data (JSON)',
	name: 'privateData',
	type: 'json',
	default: '{}',
	hint: 'Given object is merged on the top level. Nested values are set as given. Top level keys set as <code>null</code> are removed.',
	description:
		'Private data. See <a href="https://www.sharetribe.com/docs/references/extended-data/">Extended Data.</a>.',
};

export const metadataField: INodeProperties = {
	displayName: 'Metadata (JSON)',
	name: 'metadata',
	type: 'json',
	default: '{}',
	hint: 'Given object is merged on the top level. Nested values are set as given. Top level keys set as <code>null</code> are removed.',
	description:
		'Metadata. See <a href="https://www.sharetribe.com/docs/references/extended-data/">Extended Data.</a>.',
};

// ===================================
// Action Helper Functions
// ===================================

/**
 * Normalize geolocation from "lat,lng" string to {lat, lng} object
 */
export function normalizeGeolocation(
	geolocation: unknown,
): { lat: number; lng: number } | undefined {
	if (!geolocation || geolocation === ',') {
		return undefined;
	}

	const geo = String(geolocation);
	const parts = geo.split(',').map((s) => s.trim());

	if (parts.length === 2 && parts[0] && parts[1]) {
		const lat = parseFloat(parts[0]);
		const lng = parseFloat(parts[1]);

		if (!isNaN(lat) && !isNaN(lng)) {
			return { lat, lng };
		}
	}

	return undefined;
}

/**
 * Extract price from fixedCollection structure
 */
export function normalizePrice(
	priceCollection: unknown,
): { amount: number; currency: string } | undefined {
	if (!priceCollection || typeof priceCollection !== 'object') {
		return undefined;
	}

	const priceCol = priceCollection as IDataObject;
	if (!priceCol.priceFields || typeof priceCol.priceFields !== 'object') {
		return undefined;
	}

	const priceFields = priceCol.priceFields as IDataObject;
	if (priceFields.amount === undefined || !priceFields.currency) {
		return undefined;
	}

	// Extract currency from resourceLocator or plain string
	let currencyCode: string;
	if (typeof priceFields.currency === 'object' && priceFields.currency !== null) {
		const currencyLocator = priceFields.currency as IDataObject;
		currencyCode = String(currencyLocator.value || '');
	} else {
		currencyCode = String(priceFields.currency);
	}

	if (!currencyCode) {
		return undefined;
	}

	return {
		amount: Number(priceFields.amount),
		currency: currencyCode,
	};
}

/**
 * Normalize images array for Sharetribe API
 * - Empty array: Delete all images
 * - Non-empty array: Return array of image ID strings
 * - undefined/null: Keep existing images (don't send field)
 */
export function normalizeImages(images: unknown): string[] | undefined {
	if (!images || !Array.isArray(images)) {
		return undefined;
	}

	// Empty array means user wants to delete all images
	if (images.length === 0) {
		return [];
	}

	// Return array of image ID strings
	return images.map((img) => String(img));
}

/**
 * Add simple string field to body if it exists in parsed fields
 */
export function addStringField(
	body: IDataObject,
	parsedFields: IDataObject,
	fieldName: string,
	apiFieldName?: string,
): void {
	const value = parsedFields[fieldName];
	if (value !== undefined && value !== null && value !== '') {
		body[apiFieldName || fieldName] = value;
	}
}

/**
 * Add extended data fields (publicData, privateData, metadata) to body
 */
export function addExtendedDataFields(body: IDataObject, parsedFields: IDataObject): void {
	const extendedFields = ['publicData', 'privateData', 'metadata'];

	for (const field of extendedFields) {
		if (parsedFields[field]) {
			body[field] = parsedFields[field];
		}
	}
}
