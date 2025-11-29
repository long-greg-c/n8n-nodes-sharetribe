import type { INodeProperties } from 'n8n-workflow';
import {
	createFilterConditionTypeField,
	createExtendedDataAttributeField,
	getTransactionFilterOptions,
	PROPERTY_NAMES,
} from '../../GenericFunctions';
import {
	EXTENDED_DATA_TYPES,
	LoadOptionsMethod,
	UI_OPERATIONS,
	UI_RESOURCES,
} from '../../constants';

/**
 * Creates the filter options fixed collection for transaction queries
 * This centralizes the complex filter configuration to keep description files clean
 */
export const filterDescriptionTransaction: INodeProperties[] = [
	{
		displayName: 'Filter Options',
		name: 'filterOptions',
		type: 'fixedCollection',
		placeholder: 'Add filter',
		displayOptions: {
			show: {
				[PROPERTY_NAMES.RESOURCE]: [UI_RESOURCES.TRANSACTION],
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
				/* eslint-disable */
				values: [
					// NOT alphabetically sorted - manual order for better UX
					{
						displayName: 'Filter Type',
						name: 'filterType',
						type: 'options',
						options: getTransactionFilterOptions(),
						default: 'bookingStart',
						description: 'The type of filter to apply',
					},
					{
						displayName: 'Filter Mode',
						name: 'bookingStartRangeType',
						type: 'options',
						options: [
							{ name: 'Exact Date', value: 'exact' },
							{ name: 'Date Range', value: 'range' },
							{ name: 'On or After', value: 'after' },
							{ name: 'Before', value: 'before' },
						],
						default: 'exact',
						displayOptions: {
							show: { filterType: ['bookingStart'] },
						},
					},
					{
						displayName: 'Filter Mode',
						name: 'bookingEndRangeType',
						type: 'options',
						options: [
							{ name: 'Exact Date', value: 'exact' },
							{ name: 'Date Range', value: 'range' },
							{ name: 'On or After', value: 'after' },
							{ name: 'Before', value: 'before' },
						],
						default: 'exact',
						displayOptions: {
							show: { filterType: ['bookingEnd'] },
						},
					},
					{
						displayName: 'Date',
						name: 'createdAtStart',
						type: 'dateTime',
						default: '',
						placeholder: 'Date and time in UTC',
						displayOptions: {
							show: { filterType: ['createdAtStart'] },
						},
					},
					{
						displayName: 'Date',
						name: 'createdAtEnd',
						type: 'dateTime',
						default: '',
						placeholder: 'Date and time in UTC',
						displayOptions: {
							show: { filterType: ['createdAtEnd'] },
						},
					},
					{
						displayName: 'Date',
						name: 'bookingStartExact',
						type: 'dateTime',
						default: '',
						placeholder: 'Date and time in UTC',
						displayOptions: {
							show: { filterType: ['bookingStart'], bookingStartRangeType: ['exact'] },
						},
					},
					{
						displayName: 'Date',
						name: 'bookingEndExact',
						type: 'dateTime',
						default: '',
						placeholder: 'Date and time in UTC',
						displayOptions: {
							show: { filterType: ['bookingEnd'], bookingEndRangeType: ['exact'] },
						},
					},
					{
						displayName: 'Start Date',
						name: 'bookingStartStart',
						type: 'dateTime',
						default: '',
						placeholder: 'Date and time in UTC',
						displayOptions: {
							show: { filterType: ['bookingStart'], bookingStartRangeType: ['range', 'after'] },
						},
					},
					{
						displayName: 'Start Date',
						name: 'bookingEndStart',
						type: 'dateTime',
						default: '',
						placeholder: 'Date and time in UTC',
						displayOptions: {
							show: { filterType: ['bookingEnd'], bookingEndRangeType: ['range', 'after'] },
						},
					},
					{
						displayName: 'End Date',
						name: 'bookingStartEnd',
						type: 'dateTime',
						default: '',
						placeholder: 'Date and time in UTC',
						displayOptions: {
							show: { filterType: ['bookingStart'], bookingStartRangeType: ['range', 'before'] },
						},
					},
					{
						displayName: 'End Date',
						name: 'bookingEndEnd',
						type: 'dateTime',
						default: '',
						placeholder: 'Date and time in UTC',
						displayOptions: {
							show: { filterType: ['bookingEnd'], bookingEndRangeType: ['range', 'before'] },
						},
					},
					{
						displayName: 'Booking States',
						name: 'bookingStates',
						type: 'options',
						default: '',
						typeOptions: {
							loadOptionsMethod: LoadOptionsMethod.getBookingStates,
						},
						displayOptions: {
							show: { filterType: ['bookingStates'] },
						},
					},
					{
						displayName: 'Customer ID',
						name: 'customerId',
						type: 'string',
						default: '',
						displayOptions: {
							show: { filterType: ['customerId'] },
						},
					},
					{
						displayName: 'Has Booking',
						name: 'hasBooking',
						type: 'boolean',
						default: true,
						displayOptions: {
							show: { filterType: ['hasBooking'] },
						},
					},
					{
						displayName: 'Has Message',
						name: 'hasMessage',
						type: 'boolean',
						default: true,
						displayOptions: {
							show: { filterType: ['hasMessage'] },
						},
					},
					{
						displayName: 'Has Payin',
						name: 'hasPayin',
						type: 'boolean',
						default: true,
						displayOptions: {
							show: { filterType: ['hasPayin'] },
						},
					},
					{
						displayName: 'Has Stock Reservation',
						name: 'hasStockReservation',
						type: 'boolean',
						default: true,
						displayOptions: {
							show: { filterType: ['hasStockReservation'] },
						},
					},
					{
						displayName: 'Last Transition',
						name: 'lastTransitions',
						type: 'resourceLocator',
						default: { mode: 'list', value: '' },
						required: true,
						displayOptions: {
							show: { filterType: ['lastTransition'] },
						},
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
							},
						],
					},
					{
						displayName: 'Listing ID',
						name: 'listingId',
						type: 'string',
						default: '',
						displayOptions: {
							show: { filterType: ['listingId'] },
						},
					},
					{
						displayName: 'Process Names',
						name: 'processNames',
						type: 'resourceLocator',
						default: { mode: 'list', value: '' },
						required: true,
						displayOptions: {
							show: { filterType: ['processNames'] },
						},
						modes: [
							{
								displayName: 'From List',
								name: 'list',
								type: 'list',
								placeholder: 'Select process',
								typeOptions: {
									searchListMethod: LoadOptionsMethod.getProcessNames,
									searchable: true,
								},
							},
							{
								displayName: 'By Name',
								name: 'name',
								type: 'string',
								placeholder: 'default-booking',
							},
						],
					},
					{
						displayName: 'Provider ID',
						name: 'providerId',
						type: 'string',
						default: '',
						displayOptions: {
							show: { filterType: ['providerId'] },
						},
					},
					{
						displayName: 'States',
						name: 'states',
						type: 'resourceLocator',
						default: { mode: 'list', value: '' },
						required: true,
						displayOptions: {
							show: { filterType: ['states'] },
						},
						modes: [
							{
								displayName: 'From List',
								name: 'list',
								type: 'list',
								placeholder: 'Select state',
								typeOptions: {
									searchListMethod: LoadOptionsMethod.getTransactionStates,
									searchable: true,
								},
							},
							{
								displayName: 'By Name',
								name: 'name',
								type: 'string',
								placeholder: 'state/accepted',
							},
						],
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
	},
];
