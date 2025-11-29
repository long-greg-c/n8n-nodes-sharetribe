import type { TransactionProperties } from '../../Interfaces';
import { createRelationshipFields, PROPERTY_NAMES } from '../../../GenericFunctions';
import { DOCS_URLS, LoadOptionsMethod, UI_OPERATIONS, UI_RESOURCES } from '../../../constants';

export const transactionTransitionDescription: TransactionProperties = [
	{
		displayName: 'Transaction ID',
		name: 'transactionId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				[PROPERTY_NAMES.RESOURCE]: [UI_RESOURCES.TRANSACTION],
				[PROPERTY_NAMES.OPERATION]: [UI_OPERATIONS.TRANSITION],
			},
		},
		default: '',
		description: 'ID of the transaction to transition',
	},
	...createRelationshipFields(UI_OPERATIONS.TRANSITION, UI_RESOURCES.TRANSACTION),
	{
		displayName: 'Transition',
		name: 'transition',
		type: 'resourceLocator',
		required: true,
		displayOptions: {
			show: {
				[PROPERTY_NAMES.RESOURCE]: [UI_RESOURCES.TRANSACTION],
				[PROPERTY_NAMES.OPERATION]: [UI_OPERATIONS.TRANSITION],
			},
		},
		default: { mode: 'list', value: '' },
		description:
			'The transition to perform on the transaction. <a href="' +
			DOCS_URLS.TRANSACTIONS_TRANSITION +
			'" target="_blank">Learn more</a>',
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				type: 'list',
				placeholder: 'Select transition',
				typeOptions: {
					searchListMethod: LoadOptionsMethod.getTransitions,
					searchable: true,
				},
			},
			{
				displayName: 'By Name',
				name: 'name',
				type: 'string',
				placeholder: 'transition/accept',
				hint: 'Depends on your process config (e.g., transition/accept, transition/decline)',
			},
		],
	},
];
