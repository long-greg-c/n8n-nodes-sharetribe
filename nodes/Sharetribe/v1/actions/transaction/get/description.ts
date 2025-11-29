import type { TransactionProperties } from '../../Interfaces';
import {
	createRelationshipFields,
	createUserAttributesField,
	createListingAttributesField,
	PROPERTY_NAMES,
} from '../../../GenericFunctions';
import { TRANSACTION_RELATIONSHIPS, UI_OPERATIONS, UI_RESOURCES } from '../../../constants';

export const transactionGetDescription: TransactionProperties = [
	{
		displayName: 'Transaction ID',
		name: 'transactionId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				[PROPERTY_NAMES.RESOURCE]: [UI_RESOURCES.TRANSACTION],
				[PROPERTY_NAMES.OPERATION]: [UI_OPERATIONS.GET],
			},
		},
		default: '',
		description: "Transaction's ID",
	},
	...createRelationshipFields(UI_OPERATIONS.GET, UI_RESOURCES.TRANSACTION),
	createUserAttributesField(
		UI_RESOURCES.TRANSACTION,
		UI_OPERATIONS.GET,
		[TRANSACTION_RELATIONSHIPS.CUSTOMER, TRANSACTION_RELATIONSHIPS.PROVIDER],
		'User Attributes to Return',
		'Select which attributes to return for users (customer/provider) in the transaction',
	),
	createListingAttributesField(
		UI_RESOURCES.TRANSACTION,
		UI_OPERATIONS.GET,
		[TRANSACTION_RELATIONSHIPS.LISTING],
		'Listing Attributes to Return',
		'Select which attributes to return for the transaction listing',
	),
];
