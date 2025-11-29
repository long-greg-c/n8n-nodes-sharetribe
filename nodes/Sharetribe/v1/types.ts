import type { IDataObject } from 'n8n-workflow';

// ===================================
// Event Types
// ===================================

export const SHARETRIBE_EVENT_TYPES: Record<string, { name: string; value: string }[]> = {
	listing: [
		{ name: 'All Events', value: 'listing' },
		{ name: 'Created', value: 'listing/created' },
		{ name: 'Updated', value: 'listing/updated' },
		{ name: 'Deleted', value: 'listing/deleted' },
	],
	user: [
		{ name: 'All Events', value: 'user' },
		{ name: 'Created', value: 'user/created' },
		{ name: 'Updated', value: 'user/updated' },
		{ name: 'Deleted', value: 'user/deleted' },
	],
	availabilityException: [
		{ name: 'All Events', value: 'availabilityException' },
		{ name: 'Created', value: 'availabilityException/created' },
		{ name: 'Updated', value: 'availabilityException/updated' },
		{ name: 'Deleted', value: 'availabilityException/deleted' },
	],
	message: [
		{ name: 'All Events', value: 'message' },
		{ name: 'Created', value: 'message/created' },
		{ name: 'Updated', value: 'message/updated' },
		{ name: 'Deleted', value: 'message/deleted' },
	],
	transaction: [
		{ name: 'All Events', value: 'transaction' },
		{ name: 'Initiated', value: 'transaction/initiated' },
		{ name: 'Transitioned', value: 'transaction/transitioned' },
		{ name: 'Updated', value: 'transaction/updated' },
		{ name: 'Deleted', value: 'transaction/deleted' },
	],
	booking: [
		{ name: 'All Events', value: 'booking' },
		{ name: 'Created', value: 'booking/created' },
		{ name: 'Updated', value: 'booking/updated' },
		{ name: 'Deleted', value: 'booking/deleted' },
	],
	review: [
		{ name: 'All Events', value: 'review' },
		{ name: 'Created', value: 'review/created' },
		{ name: 'Updated', value: 'review/updated' },
		{ name: 'Deleted', value: 'review/deleted' },
	],
	stockAdjustment: [
		{ name: 'All Events', value: 'stockAdjustment' },
		{ name: 'Created', value: 'stockAdjustment/created' },
		{ name: 'Updated', value: 'stockAdjustment/updated' },
		{ name: 'Deleted', value: 'stockAdjustment/deleted' },
	],
	stockReservation: [
		{ name: 'All Events', value: 'stockReservation' },
		{ name: 'Created', value: 'stockReservation/created' },
		{ name: 'Updated', value: 'stockReservation/updated' },
		{ name: 'Deleted', value: 'stockReservation/deleted' },
	],
	all: [
		{ name: 'All Events', value: '' },
		{ name: 'Availability Exception Created', value: 'availabilityException/created' },
		{ name: 'Availability Exception Deleted', value: 'availabilityException/deleted' },
		{ name: 'Availability Exception Updated', value: 'availabilityException/updated' },
		{ name: 'Booking Created', value: 'booking/created' },
		{ name: 'Booking Deleted', value: 'booking/deleted' },
		{ name: 'Booking Updated', value: 'booking/updated' },
		{ name: 'Listing Created', value: 'listing/created' },
		{ name: 'Listing Deleted', value: 'listing/deleted' },
		{ name: 'Listing Updated', value: 'listing/updated' },
		{ name: 'Message Created', value: 'message/created' },
		{ name: 'Message Deleted', value: 'message/deleted' },
		{ name: 'Message Updated', value: 'message/updated' },
		{ name: 'Review Created', value: 'review/created' },
		{ name: 'Review Deleted', value: 'review/deleted' },
		{ name: 'Review Updated', value: 'review/updated' },
		{ name: 'Stock Adjustment Created', value: 'stockAdjustment/created' },
		{ name: 'Stock Adjustment Deleted', value: 'stockAdjustment/deleted' },
		{ name: 'Stock Adjustment Updated', value: 'stockAdjustment/updated' },
		{ name: 'Stock Reservation Created', value: 'stockReservation/created' },
		{ name: 'Stock Reservation Deleted', value: 'stockReservation/deleted' },
		{ name: 'Stock Reservation Updated', value: 'stockReservation/updated' },
		{ name: 'Transaction Deleted', value: 'transaction/deleted' },
		{ name: 'Transaction Initiated', value: 'transaction/initiated' },
		{ name: 'Transaction Transitioned', value: 'transaction/transitioned' },
		{ name: 'Transaction Updated', value: 'transaction/updated' },
		{ name: 'User Created', value: 'user/created' },
		{ name: 'User Deleted', value: 'user/deleted' },
		{ name: 'User Updated', value: 'user/updated' },
	],
};

// ===================================
// Base Types
// ===================================

export type UUID = string;
export type Timestamp = string; // ISO 8601 format

export interface Money {
	amount: number;
	currency: string;
}

export interface LatLng {
	lat: number;
	lng: number;
}

export interface LatLngBounds {
	ne: LatLng;
	sw: LatLng;
}

export interface BigDecimal {
	value: string; // String representation of arbitrary precision decimal
}

export interface IdentityProvider {
	idpId: string;
	userId: string;
}

export interface ProfileImage {
	id: UUID;
	type: 'image';
	attributes: {
		variants: {
			default?: {
				name: string;
				width: number;
				height: number;
				url: string;
			};
			[key: string]:
				| {
						name: string;
						width: number;
						height: number;
						url: string;
				  }
				| undefined;
		};
	};
}

export interface AvailabilityPlan {
	type: 'availability-plan/time' | 'availability-plan/day';
	timezone: string;
}

// ===================================
// User Types
// ===================================

export type UserState = 'active' | 'pendingApproval' | 'banned';

export interface UserProfile {
	firstName?: string;
	lastName?: string;
	displayName?: string;
	abbreviatedName?: string;
	bio?: string;
	metadata?: IDataObject;
	publicData?: IDataObject;
	protectedData?: IDataObject;
	privateData?: IDataObject;
}

export interface UserAttributes {
	banned: boolean;
	deleted: boolean;
	state: UserState;
	createdAt: Timestamp;
	email: string;
	emailVerified: boolean;
	pendingEmail?: string;
	stripeConnected: boolean;
	identityProviders?: IdentityProvider[];
	profile: UserProfile;
	metadata?: IDataObject;
}

export interface UserRelationships {
	marketplace?: { data: { id: UUID; type: 'marketplace' } };
	profileImage?: { data: { id: UUID; type: 'image' } | null };
	stripeAccount?: { data: { id: UUID; type: 'stripeAccount' } | null };
	effectivePermissionSet?: { data: { id: UUID; type: 'permissionSet' } };
}

export interface User {
	id: UUID;
	type: 'user';
	attributes: UserAttributes;
	relationships?: UserRelationships;
}

// ===================================
// User API Request/Response Types
// ===================================

export interface ShowUserRequest {
	id?: UUID;
	email?: string;
	expand?: boolean;
	include?: string[];
	'fields.user'?: string;
	'fields.image'?: string;
}

export interface QueryUsersRequest {
	createdAtStart?: Timestamp;
	createdAtEnd?: Timestamp;
	sort?: string;
	page?: number;
	perPage?: number;
	include?: string[];
	'fields.user'?: string;
	[key: string]: string | string[] | number | boolean | undefined; // For meta_*, priv_*, prot_*, pub_* filters
}

export interface UpdateUserProfileRequest {
	id: UUID;
	firstName?: string;
	lastName?: string;
	displayName?: string;
	bio?: string;
	publicData?: IDataObject;
	protectedData?: IDataObject;
	privateData?: IDataObject;
	metadata?: IDataObject;
	profileImageId?: UUID;
}

export interface ApproveUserRequest {
	id: UUID;
}

export interface UpdatePermissionsRequest {
	id: UUID;
	postListings?: 'permission/allow' | 'permission/deny';
	initiateTransactions?: 'permission/allow' | 'permission/deny';
	read?: 'permission/allow' | 'permission/deny';
}

// ===================================
// Listing Types
// ===================================

export type ListingState = 'draft' | 'pendingApproval' | 'published' | 'closed';

export interface ListingAttributes {
	title: string;
	description?: string;
	geolocation?: LatLng;
	createdAt: Timestamp;
	state: ListingState;
	price?: Money;
	availabilityPlan?: AvailabilityPlan;
	publicData?: IDataObject;
	privateData?: IDataObject;
	metadata?: IDataObject;
	deleted?: boolean;
}

export interface ListingRelationships {
	author?: { data: { id: UUID; type: 'user' } };
	marketplace?: { data: { id: UUID; type: 'marketplace' } };
	images?: { data: Array<{ id: UUID; type: 'image' }> };
	currentStock?: { data: { id: UUID; type: 'stock' } | null };
}

export interface Listing {
	id: UUID;
	type: 'listing';
	attributes: ListingAttributes;
	relationships?: ListingRelationships;
}

// ===================================
// Listing API Request/Response Types
// ===================================

export interface ShowListingRequest {
	id: UUID;
	expand?: boolean;
	include?: string[];
	'fields.listing'?: string;
	'fields.user'?: string;
	'fields.image'?: string;
}

export interface QueryListingsRequest {
	authorId?: UUID;
	ids?: UUID[];
	states?: ListingState[];
	createdAtStart?: Timestamp;
	createdAtEnd?: Timestamp;
	minPrice?: string;
	maxPrice?: string;
	availabilityStart?: Timestamp;
	availabilityEnd?: Timestamp;
	minStock?: number;
	bounds?: string; // "ne_lat,ne_lng,sw_lat,sw_lng"
	origin?: string; // "lat,lng"
	sort?: string;
	page?: number;
	perPage?: number;
	include?: string[];
	'fields.listing'?: string;
	[key: string]: string | string[] | number | boolean | undefined; // For pub_*, priv_*, meta_* filters
}

export interface CreateListingRequest {
	title: string;
	description?: string;
	geolocation?: LatLng | { lat: number; lng: number };
	price?: Money | { amount: number; currency: string };
	availabilityPlan?: AvailabilityPlan;
	publicData?: IDataObject;
	privateData?: IDataObject;
	metadata?: IDataObject;
	images?: UUID[];
	authorId?: UUID;
}

export interface UpdateListingRequest {
	id: UUID;
	title?: string;
	description?: string;
	geolocation?: LatLng | { lat: number; lng: number };
	price?: Money | { amount: number; currency: string };
	availabilityPlan?: AvailabilityPlan;
	publicData?: IDataObject;
	privateData?: IDataObject;
	metadata?: IDataObject;
	images?: UUID[];
}

export interface CloseListingRequest {
	id: UUID;
}

export interface OpenListingRequest {
	id: UUID;
}

export interface ApproveListingRequest {
	id: UUID;
}

// ===================================
// Transaction Types
// ===================================

export interface TransactionAttributes {
	createdAt: Timestamp;
	processName: string;
	processVersion: number;
	lastTransition: string;
	lastTransitionedAt: Timestamp;
	payinTotal?: Money;
	payoutTotal?: Money;
	lineItems?: IDataObject[];
	protectedData?: IDataObject;
	metadata?: IDataObject;
}

export interface TransactionRelationships {
	customer?: { data: { id: UUID; type: 'user' } };
	provider?: { data: { id: UUID; type: 'user' } };
	listing?: { data: { id: UUID; type: 'listing' } };
	booking?: { data: { id: UUID; type: 'booking' } | null };
	reviews?: { data: Array<{ id: UUID; type: 'review' }> };
	messages?: { data: Array<{ id: UUID; type: 'message' }> };
}

export interface Transaction {
	id: UUID;
	type: 'transaction';
	attributes: TransactionAttributes;
	relationships?: TransactionRelationships;
}

// ===================================
// Transaction API Request/Response Types
// ===================================

export interface ShowTransactionRequest {
	id: UUID;
	expand?: boolean;
	include?: string[];
	'fields.transaction'?: string;
	'fields.user'?: string;
	'fields.listing'?: string;
}

export interface QueryTransactionsRequest {
	only?: 'sale' | 'order';
	lastTransitions?: string[];
	createdAtStart?: Timestamp;
	createdAtEnd?: Timestamp;
	sort?: string;
	page?: number;
	perPage?: number;
	include?: string[];
	'fields.transaction'?: string;
	[key: string]: string | string[] | number | boolean | undefined; // For meta_*, prot_* filters
}

export interface TransitionTransactionRequest {
	id: UUID;
	transition: string;
	params?: IDataObject;
}

export interface SpeculativeTransitionRequest {
	transactionId: UUID;
	transition: string;
	params?: IDataObject;
}

export interface UpdateTransactionMetadataRequest {
	id: UUID;
	metadata: IDataObject;
}

// ===================================
// Stock Types
// ===================================

export interface StockAttributes {
	quantity: number;
}

export interface Stock {
	id: UUID;
	type: 'stock';
	attributes: StockAttributes;
}

export interface StockReservationAttributes {
	quantity: number;
	state: string;
}

export interface StockReservation {
	id: UUID;
	type: 'stockReservation';
	attributes: StockReservationAttributes;
}

// ===================================
// Stock API Request/Response Types
// ===================================

export interface QueryStockRequest {
	listingId: UUID;
}

export interface AdjustStockRequest {
	listingId: UUID;
	quantity: number;
}

export interface CompareAndSetStockRequest {
	listingId: UUID;
	oldTotal: number;
	newTotal: number;
}

export interface ShowStockReservationRequest {
	id: UUID;
}

// ===================================
// Availability Exception Types
// ===================================

export interface AvailabilityExceptionAttributes {
	start: Timestamp;
	end: Timestamp;
	seats: number;
}

export interface AvailabilityException {
	id: UUID;
	type: 'availabilityException';
	attributes: AvailabilityExceptionAttributes;
}

// ===================================
// Availability Exception API Request/Response Types
// ===================================

export interface QueryAvailabilityExceptionsRequest {
	listingId: UUID;
	start?: Timestamp;
	end?: Timestamp;
}

export interface CreateAvailabilityExceptionRequest {
	listingId: UUID;
	start: Timestamp;
	end: Timestamp;
	seats: number;
}

export interface DeleteAvailabilityExceptionRequest {
	id: UUID;
}

// ===================================
// Marketplace Types
// ===================================

export interface MarketplaceAttributes {
	name: string;
	[key: string]: string | number | boolean | IDataObject | undefined;
}

export interface Marketplace {
	id: UUID;
	type: 'marketplace';
	attributes: MarketplaceAttributes;
}

// ===================================
// Image Types
// ===================================

export interface ImageVariant {
	name: string;
	width: number;
	height: number;
	url: string;
}

export interface ImageAttributes {
	variants: {
		[key: string]: ImageVariant;
	};
}

export interface Image {
	id: UUID;
	type: 'image';
	attributes: ImageAttributes;
}

// ===================================
// JSON:API Response Types
// ===================================

/**
 * JSON:API resource object structure
 * All Sharetribe resources follow this format
 */
export interface SharetribeResource<T = IDataObject> {
	id: UUID;
	type: string;
	attributes?: T;
	relationships?: {
		[key: string]: {
			data: SharetribeResourceIdentifier | SharetribeResourceIdentifier[] | null;
		};
	};
}

/**
 * JSON:API resource identifier (used in relationships)
 */
export interface SharetribeResourceIdentifier {
	id: UUID;
	type: string;
}

/**
 * JSON:API links object for pagination
 */
export interface SharetribeLinks {
	self?: string;
	next?: string;
	prev?: string;
	first?: string;
	last?: string;
}

/**
 * JSON:API meta object with pagination information
 */
export interface SharetribeMeta {
	totalItems?: number;
	totalPages?: number;
	page?: number;
	perPage?: number;
	paginationLimit?: number;
	[key: string]: unknown;
}

/**
 * Single resource response from Sharetribe API
 * Used for endpoints that return a single resource (e.g., GET /users/{id})
 */
export interface SharetribeApiResponse<T = IDataObject> {
	data: SharetribeResource<T>;
	included?: SharetribeResource[];
	links?: SharetribeLinks;
	meta?: SharetribeMeta;
}

/**
 * Collection response from Sharetribe API
 * Used for query endpoints that return multiple resources (e.g., GET /users/query)
 */
export interface SharetribeApiCollectionResponse<T = IDataObject> {
	data: SharetribeResource<T>[];
	included?: SharetribeResource[];
	links?: SharetribeLinks;
	meta?: SharetribeMeta;
}

/**
 * Union type for any Sharetribe API response
 */
export type SharetribeApiResponseType<T = IDataObject> =
	| SharetribeApiResponse<T>
	| SharetribeApiCollectionResponse<T>;

/**
 * Deprecated: Use SharetribeApiResponse instead
 * @deprecated
 */
export interface SharetribeApiListResponse<T> {
	data: T[];
	included?: Array<User | Listing | Transaction | Image | Marketplace | Stock | IDataObject>;
	meta?: {
		totalItems: number;
		totalPages: number;
		page: number;
		perPage: number;
	};
}

// ===================================
// Normalized Response Types
// ===================================

/**
 * Normalized user object (flattened from JSON:API structure)
 * All attributes moved to root level, relationships resolved to included data
 */
export interface NormalizedUser extends IDataObject {
	id: UUID;
	type: 'user';
	banned: boolean;
	deleted: boolean;
	state: UserState;
	createdAt: Timestamp;
	email: string;
	emailVerified: boolean;
	pendingEmail?: string;
	stripeConnected: boolean;
	identityProviders?: IdentityProvider[];
	profile: UserProfile;

	// Resolved relationships
	marketplace?: NormalizedMarketplace;
	profileImage?: NormalizedImage;
	stripeAccount?: IDataObject;
	effectivePermissionSet?: IDataObject;
}

/**
 * Normalized listing object (flattened from JSON:API structure)
 */
export interface NormalizedListing extends IDataObject {
	id: UUID;
	type: 'listing';
	title: string;
	description?: string;
	geolocation?: LatLng;
	createdAt: Timestamp;
	state: ListingState;
	price?: Money;
	availabilityPlan?: AvailabilityPlan;
	publicData?: IDataObject;
	privateData?: IDataObject;
	metadata?: IDataObject;
	deleted?: boolean;
	// Resolved relationships
	author?: NormalizedUser;
	marketplace?: NormalizedMarketplace;
	images?: NormalizedImage[];
	currentStock?: NormalizedStock;
}

/**
 * Normalized transaction object (flattened from JSON:API structure)
 */
export interface NormalizedTransaction extends IDataObject {
	id: UUID;
	type: 'transaction';
	createdAt: Timestamp;
	processName: string;
	processVersion: number;
	lastTransition: string;
	lastTransitionedAt: Timestamp;
	payinTotal?: Money;
	payoutTotal?: Money;
	lineItems?: IDataObject[];
	protectedData?: IDataObject;
	metadata?: IDataObject;
	// Resolved relationships
	customer?: NormalizedUser;
	provider?: NormalizedUser;
	listing?: NormalizedListing;
	booking?: IDataObject;
	reviews?: IDataObject[];
	messages?: IDataObject[];
}

/**
 * Normalized stock object (flattened from JSON:API structure)
 */
export interface NormalizedStock extends IDataObject {
	id: UUID;
	type: 'stock';
	quantity: number;
}

/**
 * Normalized stock reservation object (flattened from JSON:API structure)
 */
export interface NormalizedStockReservation extends IDataObject {
	id: UUID;
	type: 'stockReservation';
	quantity: number;
	state: string;
}

/**
 * Normalized availability exception object (flattened from JSON:API structure)
 */
export interface NormalizedAvailabilityException extends IDataObject {
	id: UUID;
	type: 'availabilityException';
	start: Timestamp;
	end: Timestamp;
	seats: number;
	// Resolved relationships
	listing?: NormalizedListing;
}

/**
 * Normalized marketplace object (flattened from JSON:API structure)
 */
export interface NormalizedMarketplace extends IDataObject {
	id: UUID;
	type: 'marketplace';
	name: string;
	url?: string;
	currency?: string;
	timezone?: string;
	distanceUnit?: string;
	[key: string]: string | number | boolean | IDataObject | undefined;
}

/**
 * Normalized image object (flattened from JSON:API structure)
 */
export interface NormalizedImage extends IDataObject {
	id: UUID;
	type: 'image';
	variants: {
		[key: string]: ImageVariant;
	};
}

/**
 * Union type for any normalized Sharetribe resource
 */
export type NormalizedSharetribeResource =
	| NormalizedUser
	| NormalizedListing
	| NormalizedTransaction
	| NormalizedStock
	| NormalizedStockReservation
	| NormalizedAvailabilityException
	| NormalizedMarketplace
	| NormalizedImage;

// ===================================
// Error Types
// ===================================

/**
 * All possible HTTP status codes returned by Sharetribe API
 */
export type ApiErrorStatus = 400 | 401 | 402 | 403 | 404 | 409 | 413 | 429 | 500;

/**
 * Error codes for 400 Bad Request
 */
export type Error400Code =
	| 'unsupported-content-type'
	| 'bad-request'
	| 'validation-disallowed-key'
	| 'validation-invalid-value'
	| 'validation-invalid-params'
	| 'validation-missing-key';

/**
 * Error codes for 401 Unauthorized
 */
export type Error401Code = 'auth-invalid-access-token' | 'auth-missing-access-token';

/**
 * Error codes for 402 Payment Required
 */
export type Error402Code = 'transaction-payment-failed';

/**
 * Error codes for 403 Forbidden
 */
export type Error403Code = 'forbidden';

/**
 * Error codes for 404 Not Found
 */
export type Error404Code = 'not-found';

/**
 * Error codes for 409 Conflict
 */
export type Error409Code =
	| 'conflict'
	| 'image-invalid'
	| 'image-invalid-content'
	| 'email-taken'
	| 'email-already-verified'
	| 'email-unverified'
	| 'email-not-found'
	| 'listing-not-found'
	| 'listing-invalid-state'
	| 'stripe-account-not-found'
	| 'stripe-missing-api-key'
	| 'stripe-invalid-payment-intent-status'
	| 'stripe-customer-not-found'
	| 'stripe-multiple-payment-methods-not-supported'
	| 'stripe-payment-method-type-not-supported'
	| 'user-missing-stripe-account'
	| 'user-is-banned'
	| 'user-not-found'
	| 'transaction-locked'
	| 'transaction-not-found'
	| 'transaction-listing-not-found'
	| 'transaction-booking-state-not-pending'
	| 'transaction-booking-state-not-accepted'
	| 'transaction-invalid-transition'
	| 'transaction-invalid-action-sequence'
	| 'transaction-missing-listing-price'
	| 'transaction-missing-stripe-account'
	| 'transaction-same-author-and-customer'
	| 'transaction-stripe-account-disabled-charges'
	| 'transaction-stripe-account-disabled-payouts'
	| 'transaction-charge-zero-payin'
	| 'transaction-charge-zero-payout'
	| 'transaction-zero-payin'
	| 'transaction-unknown-alias'
	| 'transaction-provider-banned-or-deleted'
	| 'transaction-customer-banned-or-deleted';

/**
 * Error codes for 413 Payload Too Large
 */
export type Error413Code = 'request-larger-than-content-length' | 'request-upload-over-limit';

/**
 * Error codes for 429 Too Many Requests
 */
export type Error429Code = 'too-many-requests';

/**
 * Union of all possible error codes
 */
export type ApiErrorCode =
	| Error400Code
	| Error401Code
	| Error402Code
	| Error403Code
	| Error404Code
	| Error409Code
	| Error413Code
	| Error429Code;

/**
 * Sharetribe API error object structure
 * Based on JSON:API error specification
 */
export interface SharetribeApiError {
	id: string; // Unique ID for each instance of an error
	status: ApiErrorStatus; // HTTP status code
	code: ApiErrorCode; // Specific error code
	title: string; // Human-readable error title
	details?: string; // Optional detailed explanation
	source?: {
		path: string[]; // Path to the parameter causing the error (e.g., ['body', 'price', 'amount'])
		type: 'body' | 'query'; // Indicates body or query parameter
	};
	meta?: {
		stripeMessage?: string; // Stripe error message (for payment errors)
		stripeCode?: string; // Stripe error code (for payment errors)
		[key: string]: unknown;
	};
}

/**
 * Sharetribe API error response structure
 */
export interface SharetribeApiErrorResponse {
	errors: SharetribeApiError[];
}
