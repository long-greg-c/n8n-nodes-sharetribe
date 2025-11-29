import type { StockProperties } from '../../Interfaces';
import { PROPERTY_NAMES } from '../../../GenericFunctions';
import { DOCS_URLS, UI_OPERATIONS, UI_RESOURCES } from '../../../constants';

const STOCK_MODE = {
	FORCE_SET: 'forceSet',
} as const;

export const stockAdjustDescription: StockProperties = [
	{
		displayName: 'Listing ID',
		name: 'listingId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				[PROPERTY_NAMES.RESOURCE]: [UI_RESOURCES.STOCK],
				[PROPERTY_NAMES.OPERATION]: [UI_OPERATIONS.UPDATE_STOCK_QUANTITY],
				mode: [STOCK_MODE.FORCE_SET],
			},
		},
		description: 'ID of the listing to create stock adjustment for',
	},
	{
		displayName: 'Adjustment Quantity',
		name: 'quantity',
		type: 'number',
		typeOptions: { numberPrecision: 0 },
		required: true,
		default: 1,
		displayOptions: {
			show: {
				[PROPERTY_NAMES.RESOURCE]: [UI_RESOURCES.STOCK],
				[PROPERTY_NAMES.OPERATION]: [UI_OPERATIONS.UPDATE_STOCK_QUANTITY],
				mode: [STOCK_MODE.FORCE_SET],
			},
		},
		description:
			'Quantity to adjust stock by (positive to increase, negative to decrease). Cannot be 0. <a href="' +
			DOCS_URLS.STOCK_ADJUSTMENTS_CREATE +
			'" target="_blank">Learn more</a>',
		hint: 'Non-zero integer (e.g., 5 adds 5, -3 removes 3)',
	},
];
