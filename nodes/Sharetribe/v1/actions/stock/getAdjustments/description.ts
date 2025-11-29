import type { StockProperties } from '../../Interfaces';
import {
	createRelationshipFields,
	createResultModeFields,
	createListingAttributesField,
	createTransactionAttributesField,
	createConditionalUserAttributesField,
	PROPERTY_NAMES,
} from '../../../GenericFunctions';
import { UI_OPERATIONS, UI_RESOURCES, DOCS_URLS, STOCK_RELATIONSHIPS } from '../../../constants';

export const stockQueryDescription: StockProperties = [
	...createRelationshipFields(UI_OPERATIONS.GET_MANY, UI_RESOURCES.STOCK),
	{
		displayName: 'Listing ID',
		name: 'listingId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				[PROPERTY_NAMES.RESOURCE]: [UI_RESOURCES.STOCK],
				[PROPERTY_NAMES.OPERATION]: [UI_OPERATIONS.GET_MANY],
			},
		},
		description: 'The ID of the listing',
	},
	{
		displayName: 'Start Time',
		name: 'start',
		type: 'dateTime',
		placeholder: 'Date and time in UTC',
		default: '',
		required: true,
		validateType: 'dateTime',
		displayOptions: {
			show: {
				[PROPERTY_NAMES.RESOURCE]: [UI_RESOURCES.STOCK],
				[PROPERTY_NAMES.OPERATION]: [UI_OPERATIONS.GET_MANY],
			},
		},
		description:
			'Start time for the query range. <a href="' +
			DOCS_URLS.STOCK_ADJUSTMENTS_QUERY +
			'" target="_blank">Learn more</a>',
		hint: '366 days in the past to 1 day in the future',
	},
	{
		displayName: 'End Time',
		name: 'end',
		type: 'dateTime',
		placeholder: 'Date and time in UTC',
		default: '',
		required: true,
		validateType: 'dateTime',
		displayOptions: {
			show: {
				[PROPERTY_NAMES.RESOURCE]: [UI_RESOURCES.STOCK],
				[PROPERTY_NAMES.OPERATION]: [UI_OPERATIONS.GET_MANY],
			},
		},
		description:
			'End time for the query range. <a href="' +
			DOCS_URLS.STOCK_ADJUSTMENTS_QUERY +
			'" target="_blank">Learn more</a>',
		hint: 'After start, max 1 day future, max 366 days from start',
	},
	{
		...createListingAttributesField(UI_RESOURCES.STOCK, UI_OPERATIONS.GET_MANY, [
			STOCK_RELATIONSHIPS.LISTING,
		]),
		name: 'stockQueryListingAttributes',
	},
	{
		...createTransactionAttributesField(UI_RESOURCES.STOCK, UI_OPERATIONS.GET_MANY, [
			STOCK_RELATIONSHIPS.STOCK_RESERVATION_TRANSACTION,
		]),
		name: 'stockQueryTransactionAttributes',
	},
	{
		...createConditionalUserAttributesField(
			UI_RESOURCES.STOCK,
			UI_OPERATIONS.GET_MANY,
			[
				{
					includeOptionsValue: STOCK_RELATIONSHIPS.LISTING,
				},
			],
			'User Attributes to Return',
			'Select which attributes to return for users (listing author, transaction customer/provider)',
		)[0],
		name: 'stockQueryUserAttributes',
		displayOptions: {
			show: {
				[PROPERTY_NAMES.RESOURCE]: [UI_RESOURCES.STOCK],
				[PROPERTY_NAMES.OPERATION]: [UI_OPERATIONS.GET_MANY],
				[PROPERTY_NAMES.INCLUDE_OPTIONS]: [STOCK_RELATIONSHIPS.LISTING],
				stockQueryListingAttributes: ['author'],
			},
		},
	},
	{
		...createConditionalUserAttributesField(
			UI_RESOURCES.STOCK,
			UI_OPERATIONS.GET_MANY,
			[
				{
					includeOptionsValue: STOCK_RELATIONSHIPS.STOCK_RESERVATION_TRANSACTION,
				},
			],
			'User Attributes to Return',
			'Select which attributes to return for users (listing author, transaction customer/provider)',
		)[0],
		name: 'stockQueryUserAttributes',
		displayOptions: {
			show: {
				[PROPERTY_NAMES.RESOURCE]: [UI_RESOURCES.STOCK],
				[PROPERTY_NAMES.OPERATION]: [UI_OPERATIONS.GET_MANY],
				[PROPERTY_NAMES.INCLUDE_OPTIONS]: [STOCK_RELATIONSHIPS.STOCK_RESERVATION_TRANSACTION],
				stockQueryTransactionAttributes: ['customer', 'provider'],
			},
		},
	},
	...createResultModeFields(UI_RESOURCES.STOCK, UI_OPERATIONS.GET_MANY, 'stock adjustment'),
];
