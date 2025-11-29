import type { INodeProperties } from 'n8n-workflow';
import { PROPERTY_NAMES } from '../../GenericFunctions';
import { UI_OPERATIONS, UI_RESOURCES, RESULT_MODES } from '../../constants';

/**
 * Creates date range fields for stock queries
 */
export function createStockDateRangeFields(): INodeProperties[] {
	return [
		{
			displayName: 'Start Date',
			name: 'start',
			type: 'dateTime',
			placeholder: 'Date and time in UTC',
			required: true,
			displayOptions: {
				show: {
					[PROPERTY_NAMES.RESOURCE]: [UI_RESOURCES.STOCK],
					[PROPERTY_NAMES.OPERATION]: [UI_OPERATIONS.GET_MANY],
				},
			},
			default: '',
			description: 'The start of the time range for stock adjustments',
		},
		{
			displayName: 'End Date',
			name: 'end',
			type: 'dateTime',
			placeholder: 'Date and time in UTC',
			required: true,
			displayOptions: {
				show: {
					[PROPERTY_NAMES.RESOURCE]: [UI_RESOURCES.STOCK],
					[PROPERTY_NAMES.OPERATION]: [UI_OPERATIONS.GET_MANY],
				},
			},
			default: '',
			description: 'The end of the time range for stock adjustments',
		},
	];
}

/**
 * Creates listing ID field for stock operations
 */
export function createStockListingIdField(operation: string): INodeProperties {
	return {
		displayName: 'Listing ID',
		name: 'listingId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				[PROPERTY_NAMES.RESOURCE]: [UI_RESOURCES.STOCK],
				[PROPERTY_NAMES.OPERATION]: [operation],
			},
		},
		default: '',
		description: 'The listing ID to query stock for',
	};
}

/**
 * Creates result mode fields for stock queries
 */
export function createStockResultModeFields(): INodeProperties[] {
	return [
		// eslint-disable-next-line n8n-nodes-base/node-param-default-missing
		{
			displayName: 'Result Mode',
			name: PROPERTY_NAMES.RESULT_MODE,
			type: 'options',
			displayOptions: {
				show: {
					[PROPERTY_NAMES.RESOURCE]: [UI_RESOURCES.STOCK],
					[PROPERTY_NAMES.OPERATION]: [UI_OPERATIONS.GET_MANY],
				},
			},
			options: [
				{
					name: 'Return All',
					value: RESULT_MODES.RETURN_ALL,
					description: 'Return all results (max 100 for stock queries)',
				},
				{
					name: 'Limit',
					value: RESULT_MODES.LIMIT,
					description: 'Return a specific number of results',
				},
			],
			default: RESULT_MODES.LIMIT,
		},
		{
			displayName: 'Limit',
			name: 'limit',
			type: 'number',
			displayOptions: {
				show: {
					[PROPERTY_NAMES.RESOURCE]: [UI_RESOURCES.STOCK],
					[PROPERTY_NAMES.OPERATION]: [UI_OPERATIONS.GET_MANY],
					[PROPERTY_NAMES.RESULT_MODE]: [RESULT_MODES.LIMIT],
				},
			},
			typeOptions: {
				minValue: 1,
				maxValue: 100,
			},
			default: 50,
			description: 'Max number of results to return',
		},
	];
}
