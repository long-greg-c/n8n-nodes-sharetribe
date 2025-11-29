import type { INodeProperties } from 'n8n-workflow';
import {
	createFilterConditionTypeField,
	createExtendedDataAttributeField,
	getCommonFilterOptions,
	PROPERTY_NAMES,
} from '../../GenericFunctions';
import { UI_OPERATIONS, UI_RESOURCES, EXTENDED_DATA_TYPES } from '../../constants';

/**
 * Creates the filter options fixed collection for user queries
 * This centralizes the filter configuration to keep description files clean
 */
export function createUserFilterOptions(): INodeProperties {
	return {
		displayName: 'Filter Options',
		name: 'filterOptions',
		type: 'fixedCollection',
		placeholder: 'Add filter',
		displayOptions: {
			show: {
				[PROPERTY_NAMES.RESOURCE]: [UI_RESOURCES.USER],
				[PROPERTY_NAMES.OPERATION]: [UI_OPERATIONS.GET_MANY],
			},
		},
		typeOptions: {
			multipleValues: true,
			sortable: true,
		},
		default: {},
		options: [
			{
				displayName: 'Filters',
				name: 'filters',
				values: [
					{
						displayName: 'Filter Type',
						name: 'filterType',
						type: 'options',
						options: getCommonFilterOptions(),
						default: '',
						description: 'The type of filter to apply',
					},
					// Date range filters
					{
						displayName: 'Date',
						name: 'createdAtStart',
						type: 'dateTime',
						validateType: 'dateTime',
						placeholder: 'Date and time in UTC',
						default: '',
						displayOptions: {
							show: { filterType: ['createdAtStart'] },
						},
					},
					{
						displayName: 'Date',
						name: 'createdAtEnd',
						type: 'dateTime',
						validateType: 'dateTime',
						placeholder: 'Date and time in UTC',
						default: '',
						displayOptions: {
							show: { filterType: ['createdAtEnd'] },
						},
					},
					// Extended data attribute name fields
					createExtendedDataAttributeField(
						EXTENDED_DATA_TYPES.METADATA,
						EXTENDED_DATA_TYPES.METADATA,
					),
					createExtendedDataAttributeField(
						EXTENDED_DATA_TYPES.PRIVATE_DATA,
						EXTENDED_DATA_TYPES.PRIVATE_DATA,
					),
					createExtendedDataAttributeField(
						EXTENDED_DATA_TYPES.PROTECTED_DATA,
						EXTENDED_DATA_TYPES.PROTECTED_DATA,
					),
					createExtendedDataAttributeField(
						EXTENDED_DATA_TYPES.PUBLIC_DATA,
						EXTENDED_DATA_TYPES.PUBLIC_DATA,
					),
					// Condition type fields
					{
						...createFilterConditionTypeField(true),
						displayOptions: {
							show: {
								filterType: [
									EXTENDED_DATA_TYPES.PUBLIC_DATA,
									EXTENDED_DATA_TYPES.PRIVATE_DATA,
									EXTENDED_DATA_TYPES.PROTECTED_DATA,
									EXTENDED_DATA_TYPES.METADATA,
								],
							},
						},
					},
					// Value fields for extended data
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						displayOptions: {
							show: {
								filterType: [
									EXTENDED_DATA_TYPES.PUBLIC_DATA,
									EXTENDED_DATA_TYPES.PRIVATE_DATA,
									EXTENDED_DATA_TYPES.PROTECTED_DATA,
									EXTENDED_DATA_TYPES.METADATA,
								],
							},
						},
					},
				],
			},
		],
	};
}
