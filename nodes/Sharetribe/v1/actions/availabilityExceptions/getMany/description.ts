import type { AvailabilityExceptionProperties } from '../../Interfaces';
import {
	createRelationshipFields,
	createResultModeFields,
	PROPERTY_NAMES,
} from '../../../GenericFunctions';
import { UI_RESOURCES, UI_OPERATIONS, DOCS_URLS } from '../../../constants';

export const availabilityExceptionGetManyDescription: AvailabilityExceptionProperties = [
	...createRelationshipFields(UI_OPERATIONS.GET_MANY, UI_RESOURCES.AVAILABILITY_EXCEPTIONS),
	...createResultModeFields(
		UI_RESOURCES.AVAILABILITY_EXCEPTIONS,
		UI_OPERATIONS.GET_MANY,
		'availability exception',
	),
	{
		displayName: 'Listing ID',
		name: 'listingId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				[PROPERTY_NAMES.RESOURCE]: [UI_RESOURCES.AVAILABILITY_EXCEPTIONS],
				[PROPERTY_NAMES.OPERATION]: [UI_OPERATIONS.GET_MANY],
			},
		},
		description: 'The ID of the listing',
	},
	{
		displayName: 'Start',
		name: 'start',
		type: 'dateTime',
		placeholder: 'Date and time in UTC',
		default: '',
		required: true,
		displayOptions: {
			show: {
				[PROPERTY_NAMES.RESOURCE]: [UI_RESOURCES.AVAILABILITY_EXCEPTIONS],
				[PROPERTY_NAMES.OPERATION]: [UI_OPERATIONS.GET_MANY],
			},
		},
		description:
			'Start date and time for the query range. <a href="' +
			DOCS_URLS.AVAILABILITY_EXCEPTIONS_QUERY +
			'" target="_blank">Learn more</a>',
		hint: '366 days past to 366 days future',
	},
	{
		displayName: 'End',
		name: 'end',
		type: 'dateTime',
		placeholder: 'Date and time in UTC',
		default: '',
		required: true,
		displayOptions: {
			show: {
				[PROPERTY_NAMES.RESOURCE]: [UI_RESOURCES.AVAILABILITY_EXCEPTIONS],
				[PROPERTY_NAMES.OPERATION]: [UI_OPERATIONS.GET_MANY],
			},
		},
		description:
			'End date and time for the query range. <a href="' +
			DOCS_URLS.AVAILABILITY_EXCEPTIONS_QUERY +
			'" target="_blank">Learn more</a>',
		hint: 'After start, max 366 days future, max 366 days after start',
	},
];
