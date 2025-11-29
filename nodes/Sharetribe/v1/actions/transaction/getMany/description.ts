import type { TransactionProperties } from '../../Interfaces';
import {
	createRelationshipFields,
	createUserAttributesField,
	createListingAttributesField,
	createResultModeFields,
	PROPERTY_NAMES,
} from '../../../GenericFunctions';
import {
	UI_OPERATIONS,
	UI_RESOURCES,
	RESULT_MODES,
	TRANSACTION_RELATIONSHIPS,
} from '../../../constants';
import { filterDescriptionTransaction } from '../filterDescription';
import { sortDescriptionTransaction } from '../sortDescription';

export const transactionQueryDescription: TransactionProperties = [
	...createResultModeFields(UI_RESOURCES.TRANSACTION, UI_OPERATIONS.GET_MANY, 'transaction'),
	...createRelationshipFields(UI_OPERATIONS.GET_MANY, UI_RESOURCES.TRANSACTION),

	createUserAttributesField(
		UI_RESOURCES.TRANSACTION,
		UI_OPERATIONS.GET_MANY,
		[TRANSACTION_RELATIONSHIPS.CUSTOMER, TRANSACTION_RELATIONSHIPS.PROVIDER],
		'User Attributes to Return',
		'Select which attributes to return for users (customer/provider) in the transaction',
	),
	{
		displayName:
			'It is not recommended to return related resources for large result sets. Instead, use the IDs returned in the transaction objects to make separate requests to retrieve related resources as needed.',
		name: 'notice',
		type: 'notice',
		default: '',
		displayOptions: {
			show: {
				[PROPERTY_NAMES.RESOURCE]: [UI_RESOURCES.TRANSACTION],
				[PROPERTY_NAMES.OPERATION]: [UI_OPERATIONS.GET_MANY],
				[PROPERTY_NAMES.RESULT_MODE]: [RESULT_MODES.RETURN_ALL],
			},
		},
	},
	createListingAttributesField(
		UI_RESOURCES.TRANSACTION,
		UI_OPERATIONS.GET_MANY,
		[TRANSACTION_RELATIONSHIPS.LISTING],
		'Listing Attributes to Return',
		'Select which attributes to return for the transaction listing',
	),

	...filterDescriptionTransaction,
	...sortDescriptionTransaction,
];
