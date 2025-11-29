import type { StockProperties } from '../../Interfaces';
import { PROPERTY_NAMES } from '../../../GenericFunctions';
import { UI_OPERATIONS, UI_RESOURCES, DOCS_URLS } from '../../../constants';

const STOCK_MODE = {
	SAFELY_SET: 'safelySet',
} as const;

export const stockCompareAndSetDescription: StockProperties = [
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
				mode: [STOCK_MODE.SAFELY_SET],
			},
		},
		description: 'ID of the listing to set total stock for',
	},
	{
		displayName: 'Current Total Stock',
		name: 'oldTotal',
		type: 'number',
		typeOptions: { numberPrecision: 0 },
		default: null,
		displayOptions: {
			show: {
				[PROPERTY_NAMES.RESOURCE]: [UI_RESOURCES.STOCK],
				[PROPERTY_NAMES.OPERATION]: [UI_OPERATIONS.UPDATE_STOCK_QUANTITY],
				mode: [STOCK_MODE.SAFELY_SET],
			},
		},
		description:
			'Expected current total stock quantity. Must match for the operation to succeed (atomic compare-and-set). <a href="' +
			DOCS_URLS.STOCK_COMPARE_AND_SET +
			'" target="_blank">Learn more</a>',
		hint: 'Set to null if listing has no stock defined yet',
		placeholder: 'null or a number',
	},
	{
		displayName: 'New Total Stock',
		name: 'newTotal',
		type: 'number',
		typeOptions: { numberPrecision: 0 },
		required: true,
		default: 0,
		displayOptions: {
			show: {
				[PROPERTY_NAMES.RESOURCE]: [UI_RESOURCES.STOCK],
				[PROPERTY_NAMES.OPERATION]: [UI_OPERATIONS.UPDATE_STOCK_QUANTITY],
				mode: [STOCK_MODE.SAFELY_SET],
			},
		},
		description:
			'New total stock quantity to set for the listing. <a href="' +
			DOCS_URLS.STOCK_COMPARE_AND_SET +
			'" target="_blank">Learn more</a>',
		hint: 'Must be ≥ 0',
	},
];
