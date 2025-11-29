import {
	metadataField,
	protectedDataField,
} from '../../GenericFunctions';

// Re-export shared extended data fields with transaction-specific aliases
export {
	metadataField as transactionMetadataField,
	protectedDataField as transactionProtectedDataField,
};
