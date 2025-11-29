import type { INodeProperties } from 'n8n-workflow';
import {
	createExtendedDataAttributeField,
	getTransactionSortFields,
	getSortDirectionOptions,
	PROPERTY_NAMES,
} from '../../GenericFunctions';
import { UI_OPERATIONS, UI_RESOURCES, EXTENDED_DATA_TYPES, DOCS_URLS } from '../../constants';

/**
 * Creates the sort options fixed collection for transaction queries
 * This centralizes the sort configuration to keep description files clean
 */
export const sortDescriptionTransaction: INodeProperties[] = [
	{
		displayName: 'Sort',
		name: 'sort',
		type: 'fixedCollection',
		description:
			'Up to 3 sort options can be added. <a href="' +
			DOCS_URLS.TRANSACTIONS_SORTING +
			'" target="_blank">Learn more</a>',
		placeholder: 'Add Sort',
		typeOptions: {
			multipleValues: true,
			maxAllowedFields: 3,
			sortable: true,
		},
		displayOptions: {
			show: {
				[PROPERTY_NAMES.RESOURCE]: [UI_RESOURCES.TRANSACTION],
				[PROPERTY_NAMES.OPERATION]: [UI_OPERATIONS.GET_MANY],
			},
		},
		default: [],
		options: [
			{
				displayName: 'Sort',
				name: 'sort',
				values: [
					{
						displayName: 'Attribute',
						name: 'field',
						type: 'options',
						options: getTransactionSortFields(),
						default: '',
						description: 'The sorting attribute',
					},
					{
						displayName: 'Direction',
						name: 'direction',
						type: 'options',
						options: getSortDirectionOptions(),
						default: '',
						description: 'The sorting direction',
					},
					createExtendedDataAttributeField(
						EXTENDED_DATA_TYPES.METADATA,
						EXTENDED_DATA_TYPES.METADATA,
					),
					createExtendedDataAttributeField(
						EXTENDED_DATA_TYPES.PUBLIC_DATA,
						EXTENDED_DATA_TYPES.PUBLIC_DATA,
					),
					createExtendedDataAttributeField(
						EXTENDED_DATA_TYPES.PRIVATE_DATA,
						EXTENDED_DATA_TYPES.PRIVATE_DATA,
					),
				],
			},
		],
	},
];
