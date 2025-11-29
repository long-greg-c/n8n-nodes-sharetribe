import type { TransactionProperties } from '../../Interfaces';
import { PROPERTY_NAMES } from '../../../GenericFunctions';
import { UI_RESOURCES, UI_OPERATIONS } from '../../../constants';
import { transactionMetadataField } from '../sharedFields';

export const transactionSpeculativeTransitionDescription: TransactionProperties = [
	{
		displayName: 'Transaction ID',
		name: 'transactionId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: { [PROPERTY_NAMES.RESOURCE]: [UI_RESOURCES.TRANSACTION], [PROPERTY_NAMES.OPERATION]: [UI_OPERATIONS.SPECULATIVE_TRANSITION] },
		},
		description: 'ID of the transaction to transition',
	},
	{
		displayName: 'Transition',
		name: 'transition',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: { [PROPERTY_NAMES.RESOURCE]: [UI_RESOURCES.TRANSACTION], [PROPERTY_NAMES.OPERATION]: [UI_OPERATIONS.SPECULATIVE_TRANSITION] },
		},
		description: 'The transition to apply (e.g., confirm-payment, decline, cancel)',
	},
	{
		...transactionMetadataField,
		displayOptions: {
			show: { [PROPERTY_NAMES.RESOURCE]: [UI_RESOURCES.TRANSACTION], [PROPERTY_NAMES.OPERATION]: [UI_OPERATIONS.SPECULATIVE_TRANSITION] },
		},
	},
];
