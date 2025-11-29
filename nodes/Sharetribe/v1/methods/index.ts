export * as listSearch from './listSearch';
export * as loadOptions from './loadOptions';

// Function map for load options methods
// This provides type-safe method names with proper VS Code navigation
import * as listSearchMethods from './listSearch';
import * as loadOptionsMethods from './loadOptions';

// Function map - maps method names to actual function implementations
// Cmd+Click on function references to navigate to implementation
export const LOAD_OPTIONS_FUNCTION_MAP = {
	// List search methods (for resourceLocator searchListMethod)
	getCategoryLevel1: listSearchMethods.getCategoryLevel1,
	getCategoryLevel2: listSearchMethods.getCategoryLevel2,
	getCategoryLevel3: listSearchMethods.getCategoryLevel3,
	getCurrencyCodes: listSearchMethods.getCurrencyCodes,
	getListingTypes: listSearchMethods.getListingTypes,
	getMetadataAttributes: listSearchMethods.getMetadataAttributes,
	getPrivateDataAttributes: listSearchMethods.getPrivateDataAttributes,
	getProcessNames: listSearchMethods.getProcessNames,
	getProtectedDataAttributes: listSearchMethods.getProtectedDataAttributes,
	getPublicDataAttributes: listSearchMethods.getPublicDataAttributes,
	getTransactionStates: listSearchMethods.getTransactionStates,
	getTransitions: listSearchMethods.getTransitions,

	// Load options methods (for dropdown loadOptionsMethod)
	getBookingStates: loadOptionsMethods.getBookingStates,
} as const;

// Type-safe method name - enables VS Code navigation
export type LoadOptionsMethodKey = keyof typeof LOAD_OPTIONS_FUNCTION_MAP;

// Method name constants - maps each key to its string name
// Cmd+Click on keys in LOAD_OPTIONS_FUNCTION_MAP above to navigate to actual implementation
export const LOAD_OPTIONS_METHOD_MAP: Record<LoadOptionsMethodKey, LoadOptionsMethodKey> = {
	getCategoryLevel1: 'getCategoryLevel1',
	getCategoryLevel2: 'getCategoryLevel2',
	getCategoryLevel3: 'getCategoryLevel3',
	getCurrencyCodes: 'getCurrencyCodes',
	getListingTypes: 'getListingTypes',
	getMetadataAttributes: 'getMetadataAttributes',
	getPrivateDataAttributes: 'getPrivateDataAttributes',
	getProcessNames: 'getProcessNames',
	getProtectedDataAttributes: 'getProtectedDataAttributes',
	getPublicDataAttributes: 'getPublicDataAttributes',
	getTransactionStates: 'getTransactionStates',
	getTransitions: 'getTransitions',
	getBookingStates: 'getBookingStates',
} as const;
