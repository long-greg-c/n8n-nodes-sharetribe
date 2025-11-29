import type { AvailabilityExceptionProperties } from '../../Interfaces';
import { PROPERTY_NAMES } from '../../../GenericFunctions';
import { UI_RESOURCES, UI_OPERATIONS, DOCS_URLS } from '../../../constants';

export const availabilityExceptionCreateDescription: AvailabilityExceptionProperties = [
	{
		displayName: 'Listing ID',
		name: 'listingId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				[PROPERTY_NAMES.RESOURCE]: [UI_RESOURCES.AVAILABILITY_EXCEPTIONS],
				[PROPERTY_NAMES.OPERATION]: [UI_OPERATIONS.CREATE],
			},
		},
		description: 'ID of the listing to create exception for',
	},
	{
		displayName: 'Start Date',
		name: 'start',
		type: 'dateTime',
		required: true,
		placeholder: 'Date and time in UTC',
		default: '',
		displayOptions: {
			show: {
				[PROPERTY_NAMES.RESOURCE]: [UI_RESOURCES.AVAILABILITY_EXCEPTIONS],
				[PROPERTY_NAMES.OPERATION]: [UI_OPERATIONS.CREATE],
			},
		},
		description:
			'Start date and time of the exception. <a href="' +
			DOCS_URLS.AVAILABILITY_EXCEPTIONS_CREATE +
			'" target="_blank">Learn more</a>',
		hint: 'Max 365 days future. Minutes must be multiple of 5, seconds/ms must be 0. Use 00:00:00 UTC for day-based plans.',
	},
	{
		displayName: 'End Date',
		name: 'end',
		type: 'dateTime',
		placeholder: 'Date and time in UTC',
		required: true,
		default: '',
		displayOptions: {
			show: {
				[PROPERTY_NAMES.RESOURCE]: [UI_RESOURCES.AVAILABILITY_EXCEPTIONS],
				[PROPERTY_NAMES.OPERATION]: [UI_OPERATIONS.CREATE],
			},
		},
		description:
			'End date and time (exclusive) of the exception. <a href="' +
			DOCS_URLS.AVAILABILITY_EXCEPTIONS_CREATE +
			'" target="_blank">Learn more</a>',
		hint: 'After start. Max 365 days future. Minutes must be multiple of 5, seconds/ms must be 0. Cannot overlap existing exceptions.',
	},
	{
		displayName: 'Seats',
		name: 'seats',
		type: 'number',
		typeOptions: { numberPrecision: 0 },
		default: 1,
		displayOptions: {
			show: {
				[PROPERTY_NAMES.RESOURCE]: [UI_RESOURCES.AVAILABILITY_EXCEPTIONS],
				[PROPERTY_NAMES.OPERATION]: [UI_OPERATIONS.CREATE],
			},
		},
		description: 'Integer number of seats to make unavailable during this time period',
		hint: 'Must be a positive integer',
	},
];
