import type { INodeProperties } from 'n8n-workflow';

import * as getMany from './getAdjustments';
import * as adjust from './forceSet';
import * as safelySet from './safelySet';
import * as getReservation from './getReservation';
import { PROPERTY_NAMES } from '../../GenericFunctions';
import { UI_OPERATIONS, UI_RESOURCES } from '../../constants';

const STOCK_MODE = {
	FORCE_SET: 'forceSet',
	SAFELY_SET: 'safelySet',
} as const;

export { getMany, adjust, safelySet, getReservation };

export const descriptions: INodeProperties[] = [
	// eslint-disable-next-line n8n-nodes-base/node-param-default-missing
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				[PROPERTY_NAMES.RESOURCE]: [UI_RESOURCES.STOCK],
			},
		},
		options: [
			{
				name: 'Get Stock Adjustments',
				value: UI_OPERATIONS.GET_MANY,
				description: 'Get stock adjustments for a listing with a given ID',
				action: 'Get adjustments',
			},
			{
				name: 'Update Stock Quantity',
				value: UI_OPERATIONS.UPDATE_STOCK_QUANTITY,
				description: 'Update the stock quantity for a listing with a given ID',
				action: 'Update stock quantity',
			},
			{
				name: 'Get Reservation',
				value: UI_OPERATIONS.GET_RESERVATION,
				description: 'Get details of a stock reservation for a given ID',
				action: 'Get reservation',
			},
		],
		default: UI_OPERATIONS.GET_MANY,
	},
	// eslint-disable-next-line n8n-nodes-base/node-param-default-missing
	{
		displayName: 'Mode',
		name: 'mode',
		type: 'options',
		options: [
			{
				name: 'Create Adjustment',
				value: STOCK_MODE.FORCE_SET,
				description: 'Adjust stock (positive or negative)',
			},
			{
				name: 'Compare and Set',
				value: STOCK_MODE.SAFELY_SET,
				description: 'Set stock quantity if current quantity matches',
			},
		],
		default: STOCK_MODE.SAFELY_SET,
		displayOptions: {
			show: {
				[PROPERTY_NAMES.OPERATION]: [UI_OPERATIONS.UPDATE_STOCK_QUANTITY],
			},
		},
		description: 'Adjust existing or compare and set',
	},
	...getMany.stockQueryDescription,
	...adjust.stockAdjustDescription,
	...safelySet.stockCompareAndSetDescription,
	...getReservation.stockGetReservationDescription,
];
