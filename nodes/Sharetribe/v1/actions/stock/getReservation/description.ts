import type { INodeProperties } from 'n8n-workflow';
import {
	PROPERTY_NAMES,
	createTransactionAttributesField,
	createConditionalUserAttributesField,
	createListingAttributesField,
} from '../../../GenericFunctions';
import { UI_RESOURCES, UI_OPERATIONS } from '../../../constants';

export const stockGetReservationDescription: INodeProperties[] = [
	{
		displayName: 'Stock Reservation ID',
		name: 'stockReservationId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				[PROPERTY_NAMES.RESOURCE]: [UI_RESOURCES.STOCK],
				[PROPERTY_NAMES.OPERATION]: [UI_OPERATIONS.GET_RESERVATION],
			},
		},
		description: 'The ID of the stock reservation to show',
	},
	{
		displayName: 'Attributes to Return',
		name: PROPERTY_NAMES.INCLUDE_OPTIONS,
		type: 'multiOptions',
		displayOptions: {
			show: {
				[PROPERTY_NAMES.RESOURCE]: [UI_RESOURCES.STOCK],
				[PROPERTY_NAMES.OPERATION]: [UI_OPERATIONS.GET_RESERVATION],
			},
		},
		options: [
			{
				name: 'Listing',
				value: 'listing',
				description: 'The listing to which the stock reservation applies',
			},
			{
				name: 'Listing Current Stock',
				value: 'listing.currentStock',
				description: 'Current stock of the listing',
			},
			{ name: 'Quantity', value: 'quantity', description: 'The quantity of reserved stock' },
			{ name: 'State', value: 'state', description: 'The state of the stock reservation' },
			{
				name: 'Stock Adjustments',
				value: 'stockAdjustments',
				description: 'Stock adjustments created as a result of this reservation',
			},
			{
				name: 'Transaction',
				value: 'transaction',
				description: 'The transaction corresponding to the stock reservation',
			},
		],
		default: ['state', 'quantity'],
		description: 'Select which stock reservation attributes and relationships to return',
	},
	{
		...createListingAttributesField('stock', 'getReservation', ['listing']),
		name: 'stockGetReservationListingAttributes',
	},
	{
		...createTransactionAttributesField('stock', 'getReservation', ['transaction']),
		name: 'stockGetReservationTransactionAttributes',
	},
	{
		...createConditionalUserAttributesField(
			'stock',
			'getReservation',
			[
				{
					includeOptionsValue: 'listing',
					listingAttributeValue: 'author',
				},
			],
			'User Attributes to Return',
			'Select which attributes to return for users (listing author, transaction customer/provider)',
		)[0],
		name: 'stockGetReservationUserAttributes',
		displayOptions: {
			show: {
				[PROPERTY_NAMES.RESOURCE]: [UI_RESOURCES.STOCK],
				[PROPERTY_NAMES.OPERATION]: [UI_OPERATIONS.GET_RESERVATION],
				[PROPERTY_NAMES.INCLUDE_OPTIONS]: ['listing'],
				stockGetReservationListingAttributes: ['author'],
			},
		},
	},
	{
		...createConditionalUserAttributesField(
			'stock',
			'getReservation',
			[
				{
					includeOptionsValue: 'transaction',
				},
			],
			'User Attributes to Return',
			'Select which attributes to return for users (listing author, transaction customer/provider)',
		)[0],
		name: 'stockGetReservationUserAttributes',
		displayOptions: {
			show: {
				[PROPERTY_NAMES.RESOURCE]: [UI_RESOURCES.STOCK],
				[PROPERTY_NAMES.OPERATION]: [UI_OPERATIONS.GET_RESERVATION],
				[PROPERTY_NAMES.INCLUDE_OPTIONS]: ['transaction'],
				stockGetReservationTransactionAttributes: ['customer', 'provider'],
			},
		},
	},
];
