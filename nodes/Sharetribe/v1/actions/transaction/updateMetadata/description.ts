import type { TransactionProperties } from '../../Interfaces';
import { createRelationshipFields, PROPERTY_NAMES } from '../../../GenericFunctions';
import { UI_OPERATIONS, UI_RESOURCES } from '../../../constants';
import { transactionMetadataField } from '../sharedFields';

export const transactionUpdateMetadataDescription: TransactionProperties = [
	{
		displayName: 'Transaction ID',
		name: 'transactionId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				[PROPERTY_NAMES.RESOURCE]: [UI_RESOURCES.TRANSACTION],
				[PROPERTY_NAMES.OPERATION]: [UI_OPERATIONS.UPDATE_METADATA],
			},
		},
		default: '',
		description: 'ID of the transaction to update metadata for',
	},
	...createRelationshipFields(UI_OPERATIONS.UPDATE_METADATA, UI_RESOURCES.TRANSACTION),
	{
		...transactionMetadataField,
		displayOptions: {
			show: {
				[PROPERTY_NAMES.RESOURCE]: [UI_RESOURCES.TRANSACTION],
				[PROPERTY_NAMES.OPERATION]: [UI_OPERATIONS.UPDATE_METADATA],
			},
		},
	},
];
