// ============================================================================
// API RESOURCES
// ============================================================================
// Used in execute files for actual Sharetribe API requests
// Maps directly to Sharetribe API resource types in endpoints and query parameters
// Example: API_RESOURCES.USER → 'user' → used in fields.user, include params
// DO NOT use in description files - use UI_RESOURCES instead

export const API_RESOURCES = {
	USER: 'user',
	LISTING: 'listing',
	TRANSACTION: 'transaction',
	MARKETPLACE: 'marketplace',
	STOCK_ADJUSTMENT: 'stockAdjustment',
	IMAGE: 'image',
	AVAILABILITY_EXCEPTIONS: 'availabilityExceptions',
} as const;

export type ApiResource = (typeof API_RESOURCES)[keyof typeof API_RESOURCES];

// ============================================================================
// API OPERATIONS
// ============================================================================
// Actual Sharetribe API operation names used in execute files
// Maps to Sharetribe API endpoints (SHOW for single resource, QUERY for multiple)
// DO NOT use in description files - use UI_OPERATIONS instead

export const API_OPERATIONS = {
	ADJUST: 'adjust',
	APPROVE: 'approve',
	CLOSE: 'close',
	COMPARE_AND_SET: 'compareAndSet',
	CREATE: 'create',
	DELETE: 'delete',
	GET_RESERVATION: 'getReservation',
	OPEN: 'open',
	QUERY: 'query',
	SHOW: 'show',
	SPECULATIVE_TRANSITION: 'speculativeTransition',
	TRANSITION: 'transition',
	UPDATE: 'update',
	UPDATE_METADATA: 'updateMetadata',
	UPDATE_PERMISSIONS: 'updatePermissions',
	UPDATE_PROFILE: 'updateProfile',
	UPLOAD: 'upload',
};

export type ApiOperation = (typeof API_OPERATIONS)[keyof typeof API_OPERATIONS];

// ============================================================================
// UI RESOURCE NAMES - same as API apart from stock which is grouped in UI
// ============================================================================
// Use in description files for displayOptions.show conditions
// Example: [PROPERTY_NAMES.RESOURCE]: [UI_RESOURCES.LISTING]

export const UI_RESOURCES = {
	USER: 'user',
	LISTING: 'listing',
	TRANSACTION: 'transaction',
	MARKETPLACE: 'marketplace',
	STOCK: 'stock',
	STOCK_RESERVATION: 'stockReservation',
	IMAGE: 'image',
	AVAILABILITY_EXCEPTIONS: 'availabilityExceptions',
} as const;

export type UiResource = (typeof UI_RESOURCES)[keyof typeof UI_RESOURCES];

// ============================================================================
// UI OPERATION NAMES
// ============================================================================
// Use in description files for displayOptions.show conditions
// Example: [PROPERTY_NAMES.OPERATION]: [UI_OPERATIONS.GET]
// UI operations map to API operations: GET → SHOW, GET_MANY → QUERY

export const UI_OPERATIONS = {
	ADJUST: 'adjust',
	APPROVE: 'approve',
	CLOSE: 'close',
	CREATE: 'create',
	DELETE: 'delete',
	FORCE_SET: 'forceSet',
	GET: 'get',
	GET_MANY: 'getMany',
	GET_RESERVATION: 'getReservation',
	OPEN: 'open',
	SAFELY_SET: 'safelySet',
	SPECULATIVE_TRANSITION: 'speculativeTransition',
	TRANSITION: 'transition',
	UPDATE: 'update',
	UPDATE_METADATA: 'updateMetadata',
	UPDATE_PERMISSIONS: 'updatePermissions',
	UPDATE_PROFILE: 'updateProfile',
	UPDATE_STOCK_QUANTITY: 'updateStockQuantity',
	UPLOAD: 'upload',
} as const;

export type UiOperation = (typeof UI_OPERATIONS)[keyof typeof UI_OPERATIONS];

// ============================================================================
// API ENDPOINTS
// ============================================================================

export const ENDPOINTS = {
	// User endpoints
	USERS_GET: 'users/show',
	USERS_QUERY: 'users/query',
	USERS_UPDATE: 'users/update',
	USERS_UPDATE_PROFILE: 'users/update_profile',
	USERS_APPROVE: 'users/approve',
	USERS_UPDATE_PERMISSIONS: 'users/update-permissions',

	// Listing endpoints
	LISTINGS_GET: 'listings/show',
	LISTINGS_QUERY: 'listings/query',
	LISTINGS_CREATE: 'listings/create',
	LISTINGS_UPDATE: 'listings/update',
	LISTINGS_APPROVE: 'listings/approve',
	LISTINGS_OPEN: 'listings/open',
	LISTINGS_CLOSE: 'listings/close',

	// Transaction endpoints
	TRANSACTIONS_GET: 'transactions/show',
	TRANSACTIONS_QUERY: 'transactions/query',
	TRANSACTIONS_TRANSITION: 'transactions/transition',
	TRANSACTIONS_SPECULATIVE_TRANSITION: 'transactions/speculativeTransition',
	TRANSACTIONS_UPDATE_METADATA: 'transactions/updateMetadata',

	// Marketplace endpoints
	MARKETPLACE_GET: 'marketplace/show',

	// Image endpoints
	IMAGES_UPLOAD: 'images/upload',

	// Availability exception endpoints
	AVAILABILITY_EXCEPTIONS_QUERY: 'availability_exceptions/query',
	AVAILABILITY_EXCEPTIONS_CREATE: 'availability_exceptions/create',
	AVAILABILITY_EXCEPTIONS_DELETE: 'availability_exceptions/delete',

	// Stock endpoints
	STOCK_ADJUSTMENTS_QUERY: 'stock_adjustments/query',
	STOCK_ADJUSTMENTS_CREATE: 'stock_adjustments/create',
	STOCK_RESERVATIONS_GET: 'stock_reservations/show',
	STOCK_COMPARE_AND_SET: 'stock/compare_and_set',
} as const;

export type Endpoints = (typeof ENDPOINTS)[keyof typeof ENDPOINTS];

// ============================================================================
// HTTP METHODS
// ============================================================================

export const HTTP_METHODS = {
	GET: 'GET',
	POST: 'POST',
	PUT: 'PUT',
	DELETE: 'DELETE',
	PATCH: 'PATCH',
} as const;

// ============================================================================
// EXTENDED DATA FIELD TYPES
// ============================================================================

export const EXTENDED_DATA_TYPES = {
	METADATA: 'metadata',
	PUBLIC_DATA: 'publicData',
	PRIVATE_DATA: 'privateData',
	PROTECTED_DATA: 'protectedData',
} as const;

export type ExtendedDataType = (typeof EXTENDED_DATA_TYPES)[keyof typeof EXTENDED_DATA_TYPES];

// Array of all extended data types for iteration
export const EXTENDED_DATA_TYPES_ARRAY = Object.values(EXTENDED_DATA_TYPES);

// ============================================================================
// EXTENDED DATA PREFIXES (for query parameters)
// ============================================================================

export const EXTENDED_DATA_PREFIXES = {
	[EXTENDED_DATA_TYPES.METADATA]: 'meta',
	[EXTENDED_DATA_TYPES.PUBLIC_DATA]: 'pub',
	[EXTENDED_DATA_TYPES.PRIVATE_DATA]: 'priv',
	[EXTENDED_DATA_TYPES.PROTECTED_DATA]: 'prot',
} as const;

// ============================================================================
// API QUERY PARAMETER NAMES
// ============================================================================

export const QUERY_PARAMS = {
	// Sparse fields parameters
	FIELDS_USER: 'fields.user',
	FIELDS_LISTING: 'fields.listing',
	FIELDS_TRANSACTION: 'fields.transaction',
	FIELDS_STOCK_ADJUSTMENT: 'fields.stockAdjustment',

	// Relationship parameters
	INCLUDE: 'include',
	EXPAND: 'expand',

	// Pagination parameters
	PAGE: 'page',
	PER_PAGE: 'perPage',

	// Sorting parameters
	SORT: 'sort',
	ORDER: 'order',

	// Common filter parameters
	ID: 'id',
} as const;

// ============================================================================
// JSON:API RESPONSE STRUCTURE KEYS
// ============================================================================

export const API_RESPONSE_KEYS = {
	ID: 'id',
	TYPE: 'type',
	DATA: 'data',
	ATTRIBUTES: 'attributes',
	RELATIONSHIPS: 'relationships',
	INCLUDED: 'included',
	META: 'meta',
	TOTAL_ITEMS: 'totalItems',
	TOTAL_PAGES: 'totalPages',
} as const;

// ============================================================================
// RESULT MODES
// ============================================================================

export const RESULT_MODES = {
	RETURN_ALL: 'returnAll',
	LIMIT: 'limit',
	MANUAL_PAGINATION: 'manualPagination',
	TOTALS: 'totals',
} as const;

export type ResultMode = (typeof RESULT_MODES)[keyof typeof RESULT_MODES];

// ============================================================================
// CONDITION TYPES (for filtering)
// ============================================================================

export const CONDITION_TYPES = {
	EQUALS: 'eq',
	GREATER_THAN_OR_EQUAL: 'gteq',
	LESS_THAN: 'lt',
	RANGE: 'range',
	HAS_ALL: 'hasAll',
	HAS_ANY: 'hasAny',
} as const;

export type ConditionType = (typeof CONDITION_TYPES)[keyof typeof CONDITION_TYPES];

// ============================================================================
// FILTER TYPES (common across resources)
// ============================================================================

export const FILTER_TYPES = {
	CREATED_AT_START: 'createdAtStart',
	CREATED_AT_END: 'createdAtEnd',
	METADATA: 'metadata',
	PUBLIC_DATA: 'publicData',
	PRIVATE_DATA: 'privateData',
	PROTECTED_DATA: 'protectedData',
} as const;

export type FilterType = (typeof FILTER_TYPES)[keyof typeof FILTER_TYPES];

// ============================================================================
// COMMON FILTER OPTIONS (for filter type dropdowns)
// ============================================================================

export const COMMON_FILTER_OPTIONS = {
	CREATED_BEFORE: {
		name: 'Created Before',
		value: FILTER_TYPES.CREATED_AT_END,
		description: 'Filter by creation date before a specific date and time',
	},
	CREATED_ON_OR_AFTER: {
		name: 'Created On or After',
		value: FILTER_TYPES.CREATED_AT_START,
		description: 'Filter by creation date on or after a specific date and time',
	},
	METADATA: {
		name: 'Metadata Attribute',
		value: FILTER_TYPES.METADATA,
		description: 'Filter by custom metadata attribute values',
	},
	PUBLIC_DATA: {
		name: 'Public Data Attribute',
		value: FILTER_TYPES.PUBLIC_DATA,
		description: 'Filter by public data attribute values',
	},
	PRIVATE_DATA: {
		name: 'Private Data Attribute',
		value: FILTER_TYPES.PRIVATE_DATA,
		description: 'Filter by private data attribute values',
	},
	PROTECTED_DATA: {
		name: 'Protected Data Attribute',
		value: FILTER_TYPES.PROTECTED_DATA,
		description: 'Filter by protected data attribute values',
	},
} as const;

// ============================================================================
// TRANSACTION-SPECIFIC FILTER OPTIONS
// ============================================================================

export const TRANSACTION_FILTER_OPTIONS = {
	BOOKING_END: {
		name: 'Booking End',
		value: 'bookingEnd',
		description: 'Filter by booking end date with range options',
	},
	BOOKING_START: {
		name: 'Booking Start',
		value: 'bookingStart',
		description: 'Filter by booking start date with range options',
	},
	BOOKING_STATES: {
		name: 'Booking States',
		value: 'bookingStates',
		description: 'Filter by booking states (accepted, pending, etc.)',
	},
	CUSTOMER_ID: {
		name: 'Customer ID',
		value: 'customerId',
		description: 'Filter by specific customer/buyer ID',
	},
	HAS_BOOKING: {
		name: 'Has Booking',
		value: 'hasBooking',
		description: 'Filter transactions that have or do not have bookings',
	},
	HAS_MESSAGE: {
		name: 'Has Message',
		value: 'hasMessage',
		description: 'Filter transactions that have or do not have messages',
	},
	HAS_PAYIN: {
		name: 'Has Payin',
		value: 'hasPayin',
		description: 'Filter transactions that have or do not have payins',
	},
	HAS_STOCK_RESERVATION: {
		name: 'Has Stock Reservation',
		value: 'hasStockReservation',
		description: 'Filter transactions that have or do not have stock reservations',
	},
	LAST_TRANSITION: {
		name: 'Last Transition',
		value: 'lastTransition',
		description: "Filter by transaction's last transition",
	},
	LISTING_ID: {
		name: 'Listing ID',
		value: 'listingId',
		description: 'Filter by specific listing ID',
	},
	PROCESS_NAMES: {
		name: 'Process Names',
		value: 'processNames',
		description: 'Filter by transaction process names',
	},
	PROVIDER_ID: {
		name: 'Provider ID',
		value: 'providerId',
		description: 'Filter by specific provider/seller ID',
	},
	STATES: {
		name: 'States',
		value: 'states',
		description: 'Filter by transaction states (confirmed, paid, etc.)',
	},
} as const;

// ============================================================================
// SORT DIRECTIONS
// ============================================================================

export const SORT_DIRECTIONS = {
	ASCENDING: 'ASC',
	DESCENDING: 'DESC',
} as const;

export type SortDirection = (typeof SORT_DIRECTIONS)[keyof typeof SORT_DIRECTIONS];

// ============================================================================
// COMMON SORT FIELDS (for sort field dropdowns)
// ============================================================================

export const COMMON_SORT_FIELDS = {
	CREATED_AT: {
		name: 'Created At',
		value: 'createdAt',
		description: 'Sort by creation date',
	},
	METADATA: {
		name: 'Metadata Attribute',
		value: 'metadata',
		description: 'Sort by custom metadata attribute',
	},
	PUBLIC_DATA: {
		name: 'Public Data Attribute',
		value: 'publicData',
		description: 'Sort by public data attribute',
	},
	PRIVATE_DATA: {
		name: 'Private Data Attribute',
		value: 'privateData',
		description: 'Sort by private data attribute',
	},
	PROTECTED_DATA: {
		name: 'Protected Data Attribute',
		value: 'protectedData',
		description: 'Sort by protected data attribute',
	},
} as const;

// ============================================================================
// ATTRIBUTE KEYS (for each resource type)
// ============================================================================

/**
 * User attribute keys that are valid for sparse fields
 */
export const USER_ATTRIBUTE_KEYS = [
	'email',
	'emailVerified',
	'pendingEmail',
	'stripeConnected',
	'createdAt',
	'profile',
	'publicData',
	'protectedData',
	'privateData',
	'metadata',
] as const;

/**
 * Listing attribute keys that are valid for sparse fields
 */
export const LISTING_ATTRIBUTE_KEYS = [
	'title',
	'description',
	'geolocation',
	'createdAt',
	'state',
	'availabilityPlan',
	'price',
	'publicData',
	'privateData',
	'metadata',
	'currentStock',
] as const;

/**
 * Transaction attribute keys that are valid for sparse fields
 */
export const TRANSACTION_ATTRIBUTE_KEYS = [
	'createdAt',
	'processName',
	'processVersion',
	'lastTransition',
	'lastTransitionedAt',
	'transitions',
	'payinTotal',
	'payoutTotal',
	'lineItems',
	'protectedData',
	'metadata',
] as const;

// ============================================================================
// USER FIELD MAPPINGS (UI name → API path)
// ============================================================================

/**
 * Maps user attribute UI names to their API field paths.
 * Some fields are nested under 'profile' in the API.
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
	metadata: 'metadata',
	pendingEmail: 'pendingEmail',
	stripeConnected: 'stripeConnected',
	stripeAccount: 'stripeAccount',
	identityProviders: 'identityProviders',
	deleted: 'deleted',
	effectivePermissionSet: 'effectivePermissionSet',
};

// ============================================================================
// RELATIONSHIP KEYS (for include parameters)
// ============================================================================

export const USER_RELATIONSHIPS = {
	MARKETPLACE: 'marketplace',
	PROFILE_IMAGE: 'profileImage',
	STRIPE_ACCOUNT: 'stripeAccount',
	EFFECTIVE_PERMISSION_SET: 'effectivePermissionSet',
} as const;

export const LISTING_RELATIONSHIPS = {
	AUTHOR: 'author',
	IMAGES: 'images',
	MARKETPLACE: 'marketplace',
	CURRENT_STOCK: 'currentStock',
} as const;

export const TRANSACTION_RELATIONSHIPS = {
	CUSTOMER: 'customer',
	PROVIDER: 'provider',
	LISTING: 'listing',
	BOOKING: 'booking',
	REVIEWS: 'reviews',
	MESSAGES: 'messages',
} as const;

export const STOCK_RELATIONSHIPS = {
	LISTING: 'listing',
	LISTING_AUTHOR: 'listing.author',
	LISTING_CURRENT_STOCK: 'listing.currentStock',
	TRANSACTION: 'transaction',
	TRANSACTION_CUSTOMER: 'transaction.customer',
	TRANSACTION_PROVIDER: 'transaction.provider',
	STOCK_RESERVATION: 'stockReservation',
	STOCK_RESERVATION_TRANSACTION: 'stockReservation.transaction',
	STOCK_ADJUSTMENTS: 'stockAdjustments',
} as const;

export const AVAILABILITY_EXCEPTION_RELATIONSHIPS = {
	LISTING: 'listing',
} as const;

/**
 * Union type of all valid relationship paths across all resources
 * Used in includeOptions parameters to specify which related resources to fetch
 */
export type RelationshipPath =
	| (typeof USER_RELATIONSHIPS)[keyof typeof USER_RELATIONSHIPS]
	| (typeof LISTING_RELATIONSHIPS)[keyof typeof LISTING_RELATIONSHIPS]
	| (typeof TRANSACTION_RELATIONSHIPS)[keyof typeof TRANSACTION_RELATIONSHIPS]
	| (typeof STOCK_RELATIONSHIPS)[keyof typeof STOCK_RELATIONSHIPS];

// ============================================================================
// FILTER TYPES (for query operations)
// ============================================================================

export const LISTING_FILTER_TYPES = {
	AUTHOR_ID: 'authorId',
	AVAILABILITY: 'availability',
	CATEGORY: 'category',
	CREATED_AT_END: 'createdAtEnd',
	CREATED_AT_START: 'createdAtStart',
	IDS: 'ids',
	KEYWORDS: 'keywords',
	LISTING_TYPE: 'listingType',
	LOCATION: 'location',
	BOUNDS: 'bounds',
	METADATA: 'metadata',
	PRICE: 'price',
	PRIVATE_DATA: 'privateData',
	PUBLIC_DATA: 'publicData',
	STATES: 'states',
	STOCK: 'stock',
} as const;

export const TRANSACTION_FILTER_TYPES = {
	BOOKING_END: 'bookingEnd',
	BOOKING_START: 'bookingStart',
	BOOKING_STATES: 'bookingStates',
	CREATED_AT_END: 'createdAtEnd',
	CREATED_AT_START: 'createdAtStart',
	CUSTOMER_ID: 'customerId',
	HAS_BOOKING: 'hasBooking',
	HAS_MESSAGE: 'hasMessage',
	HAS_PAYIN: 'hasPayin',
	HAS_STOCK_RESERVATION: 'hasStockReservation',
	IDS: 'ids',
	LAST_TRANSITIONS: 'lastTransitions',
	LISTING_ID: 'listingId',
	METADATA: 'metadata',
	PRIVATE_DATA: 'privateData',
	PROTECTED_DATA: 'protectedData',
	PROCESS_NAMES: 'processNames',
	PROVIDER_ID: 'providerId',
	PUBLIC_DATA: 'publicData',
	STATES: 'states',
	STOCK_RESERVATION_STATES: 'stockReservationStates',
} as const;

export const USER_FILTER_TYPES = {
	CREATED_AT_END: 'createdAtEnd',
	CREATED_AT_START: 'createdAtStart',
	EMAIL: 'email',
	IDS: 'ids',
	METADATA: 'metadata',
	PRIVATE_DATA: 'privateData',
	PROTECTED_DATA: 'protectedData',
	PUBLIC_DATA: 'publicData',
	STATE: 'state',
} as const;

// ============================================================================
// SORT FIELD TYPES
// ============================================================================

export const LISTING_SORT_FIELDS = {
	CREATED_AT: 'createdAt',
	METADATA: 'metadata',
	PRICE: 'price',
	PRIVATE_DATA: 'privateData',
	PUBLIC_DATA: 'publicData',
} as const;

export const TRANSACTION_SORT_FIELDS = {
	CREATED_AT: 'createdAt',
	LAST_TRANSITIONED_AT: 'lastTransitionedAt',
	METADATA: 'metadata',
	PRIVATE_DATA: 'privateData',
	PROTECTED_DATA: 'protectedData',
	PUBLIC_DATA: 'publicData',
} as const;

export const USER_SORT_FIELDS = {
	CREATED_AT: 'createdAt',
	METADATA: 'metadata',
	PRIVATE_DATA: 'privateData',
	PROTECTED_DATA: 'protectedData',
	PUBLIC_DATA: 'publicData',
} as const;

// ============================================================================
// NODE PARAMETER NAMES (n8n UI parameters)
// ============================================================================
// ALWAYS use in description files for displayOptions.show keys
// Example: [PROPERTY_NAMES.RESOURCE]: [UI_RESOURCES.LISTING]
// DO NOT use string literals like 'resource' - always use PROPERTY_NAMES.RESOURCE
// These are the actual parameter names that n8n uses internally

export const PROPERTY_NAMES = {
	RESOURCE: 'resource',
	OPERATION: 'operation',
	INCLUDE_OPTIONS: 'includeOptions',
	RESULT_MODE: 'resultMode',
	LIMIT: 'limit',
	START_QUERY_MODE: 'startQueryMode',
	RESOURCE_FILTER: 'resourceFilter',
	CONDITION_TYPE: 'condition_type',
	DIRECTION: 'direction',
	FILTER_TYPE: 'filterType',
	FIELD: 'field',
} as const;

// ============================================================================
// HTTP HEADERS
// ============================================================================

export const HEADERS = {
	CONTENT_TYPE_JSON: 'application/json; charset=utf-8',
	CONTENT_TYPE_MULTIPART: 'multipart/form-data',
} as const;

// ============================================================================
// CDN PATHS
// ============================================================================

export const CDN = {
	CATEGORIES_BASE: 'https://cdn.st-api.com/v1/assets/pub',
} as const;

// ============================================================================
// PROFILE NESTED FIELDS
// ============================================================================

/**
 * User fields that are nested under the 'profile' object in the API
 */
export const PROFILE_NESTED_FIELDS = [
	'firstName',
	'lastName',
	'displayName',
	'abbreviatedName',
	'bio',
	'publicData',
	'protectedData',
	'privateData',
] as const;

// ============================================================================
// DOCUMENTATION URLS
// ============================================================================

const DOCS_BASE_URL = 'https://www.sharetribe.com/api-reference/integration.html';

export const DOCS_URLS = {
	BASE: DOCS_BASE_URL,
	AVAILABILITY_FILTERING: `${DOCS_BASE_URL}#availability-filtering`,
	STOCK_ADJUSTMENTS_QUERY: `${DOCS_BASE_URL}#query-stock-adjustments`,
	STOCK_ADJUSTMENTS_CREATE: `${DOCS_BASE_URL}#create-stock-adjustment`,
	STOCK_COMPARE_AND_SET: `${DOCS_BASE_URL}#compare-and-set-total-stock`,
	AVAILABILITY_EXCEPTIONS_QUERY: `${DOCS_BASE_URL}#query-availability-exceptions`,
	AVAILABILITY_EXCEPTIONS_CREATE: `${DOCS_BASE_URL}#create-availability-exceptions`,
	LISTINGS_QUERY: `${DOCS_BASE_URL}#query-listings`,
	LISTINGS_SORTING: `${DOCS_BASE_URL}#controlling-sorting-of-listings`,
	TRANSACTIONS_SORTING: `${DOCS_BASE_URL}#transaction-sorting`,
	TRANSACTIONS_TRANSITION: `${DOCS_BASE_URL}#transition-transaction`,
} as const;

// ============================================================================
// LIST SEARCH METHOD NAMES (for searchListMethod and loadOptionsMethod)
// ============================================================================
// Load options method names with proper VS Code navigation
// Re-export from methods/index.ts for convenience
// Cmd+Click on LoadOptionsMethod usage to see the map, then Cmd+Click on map keys to navigate to implementation
export { LOAD_OPTIONS_METHOD_MAP as LoadOptionsMethod } from './methods';

// ============================================================================
// API BASE PATH
// ============================================================================

export const API_BASE_PATH = 'v1/integration_api';

export enum CurrencyCode {
	AUD = 'AUD',
	BGN = 'BGN',
	CAD = 'CAD',
	CHF = 'CHF',
	CNY = 'CNY',
	CZK = 'CZK',
	DKK = 'DKK',
	EUR = 'EUR',
	GBP = 'GBP',
	HKD = 'HKD',
	INR = 'INR',
	JPY = 'JPY',
	MXN = 'MXN',
	NOK = 'NOK',
	NZD = 'NZD',
	PLN = 'PLN',
	RON = 'RON',
	SEK = 'SEK',
	SGD = 'SGD',
	USD = 'USD',
}

export const CURRENCY_SUBUNIT_DIVISORS: Record<CurrencyCode, number> = {
	[CurrencyCode.AUD]: 100,
	[CurrencyCode.BGN]: 100,
	[CurrencyCode.CAD]: 100,
	[CurrencyCode.CHF]: 100,
	[CurrencyCode.CNY]: 100,
	[CurrencyCode.CZK]: 100,
	[CurrencyCode.DKK]: 100,
	[CurrencyCode.EUR]: 100,
	[CurrencyCode.GBP]: 100,
	[CurrencyCode.HKD]: 100,
	[CurrencyCode.INR]: 100,
	[CurrencyCode.JPY]: 1,
	[CurrencyCode.MXN]: 100,
	[CurrencyCode.NOK]: 100,
	[CurrencyCode.NZD]: 100,
	[CurrencyCode.PLN]: 100,
	[CurrencyCode.RON]: 100,
	[CurrencyCode.SEK]: 100,
	[CurrencyCode.SGD]: 100,
	[CurrencyCode.USD]: 100,
};

// ============================================================================
// CACHE AND DISCOVERY CONFIGURATION
// ============================================================================

/**
 * Cache TTL (Time To Live) in seconds
 * Default: 5 minutes
 * When cache expires, incremental fetch is performed to learn from new transactions
 */
export const CACHE_TTL_SECONDS = 300;

/**
 * Number of resources to fetch for initial discovery
 * These limits apply when first populating the cache
 */
export const DISCOVERY_INITIAL_LIMITS = {
	TRANSACTIONS: 10,
	USERS: 10,
	LISTINGS: 10,
} as const;

/**
 * Number of resources to fetch on incremental refresh
 * These limits apply when cache expires and we fetch new data
 */
export const DISCOVERY_INCREMENTAL_LIMITS = {
	TRANSACTIONS: 10,
	USERS: 10,
	LISTINGS: 10,
} as const;

/**
 * Predefined publicData fields that have their own dedicated filters
 * These fields should be excluded from generic publicData dropdown since they're handled separately
 */
export const PREDEFINED_PUBLIC_DATA_FIELDS: string[] = [
	'publicData.categoryLevel1',
	'publicData.categoryLevel2',
	'publicData.categoryLevel3',
	'publicData.listingType',
];
