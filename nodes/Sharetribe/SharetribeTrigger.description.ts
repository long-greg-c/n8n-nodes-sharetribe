import type { INodeProperties } from 'n8n-workflow';
import { SHARETRIBE_EVENT_TYPES } from './v1/types';
import { createEventTypeFields } from './v1/GenericFunctions';

// ===================================
// Resource Selection
// ===================================

export const resourceField: INodeProperties = {
	displayName: 'Resource',
	name: 'resource',
	type: 'options',
	noDataExpression: true,
	options: [
		{ name: 'All', value: 'all' },
		{ name: 'Availability Exception', value: 'availabilityException' },
		{ name: 'Booking', value: 'booking' },
		{ name: 'Listing', value: 'listing' },
		{ name: 'Message', value: 'message' },
		{ name: 'Review', value: 'review' },
		{ name: 'Stock Adjustment', value: 'stockAdjustment' },
		{ name: 'Stock Reservation', value: 'stockReservation' },
		{ name: 'Transaction', value: 'transaction' },
		{ name: 'User', value: 'user' },
	],
	default: 'transaction',
	required: true,
};

// ===================================
// Event Type Fields (Generated Dynamically)
// ===================================

export const eventTypeFields = createEventTypeFields(
	[
		'all',
		'availabilityException',
		'listing',
		'user',
		'transaction',
		'message',
		'booking',
		'review',
		'stockAdjustment',
		'stockReservation',
	],
	SHARETRIBE_EVENT_TYPES,
);

// ===================================
// Start Query Mode Fields
// ===================================

/**
 * Creates start query mode fields for a specific resource
 * @param resource - Resource name (e.g., 'listing', 'user', 'all')
 * @param resourceLabel - Display label for the resource (e.g., 'Listing', 'User', 'Events')
 */
export function createStartQueryModeFields(
	resource: string,
	resourceLabel: string,
): INodeProperties[] {
	const isAll = resource === 'all';
	const eventLabel = isAll ? 'events' : `${resourceLabel.toLowerCase()} events`;
	const eventLabelCap = isAll ? 'Events' : `${resourceLabel} Events`;

	return [
		{
			displayName: `Starting From`,
			displayOptions: { show: { resource: [resource] } },
			name: 'startQueryMode',
			type: 'options',
			default: 'lastPoll',
			options: [
				{
					name: 'First Poll',
					value: 'lastPoll',
					description: `${eventLabelCap} from initial poll`,
				},
				{
					name: 'Specific Time',
					value: 'specificTime',
					description: `${eventLabelCap} from a specific timestamp`,
				},
				{
					name: 'Specific Sequence ID',
					value: 'sequenceId',
					description: `${eventLabelCap} after a specific event sequence ID`,
				},
				{
					name: 'All Past Events',
					value: 'allEvents',
					description: `All available ${eventLabel} (up to 90 days for live, 7 days for dev/test)`,
				},
			],
			description: `Starting point for ${eventLabel} polling`,
		},
		{
			displayName: 'Start Time',
			name: 'startTime',
			type: 'dateTime',
			placeholder: 'Date and time in UTC',
			default: '',
			displayOptions: {
				show: {
					startQueryMode: ['specificTime'],
					resource: [resource],
				},
			},
			description: `Return only ${eventLabel} created on or after this timestamp. Can be at most 90 days in the past for live marketplaces or 7 days for dev/test.`,
		},
		{
			displayName: 'Start After Sequence ID',
			name: 'startAfterSequenceId',
			type: 'number',
			default: 0,
			displayOptions: {
				show: {
					startQueryMode: ['sequenceId'],
					resource: [resource],
				},
			},
			description: `Return ${eventLabel} with sequence ID strictly larger than this value`,
		},
	];
}

// ===================================
// Resource Filter Fields
// ===================================

/**
 * Creates resource filter fields for a specific resource type
 * @param resource - Resource name (e.g., 'listing', 'user', 'transaction')
 * @param resourceLabel - Display label for the resource (e.g., 'Listing', 'User')
 * @param relatedResources - Array of related resource names
 */
export function createResourceFilterFields(
	resource: string,
	resourceLabel: string,
	relatedResources: string[],
): INodeProperties[] {
	const plural = resource === 'booking' ? 'bookings' : `${resource}s`;
	const relatedResourcesStr = relatedResources.join(', ');

	return [
		{
			displayName: 'Filter',
			displayOptions: { show: { resource: [resource] } },
			name: 'resourceFilter',
			type: 'options',
			default: 'none',
			options: [
				{
					name: 'No Filter',
					value: 'none',
					description: `Return events for all ${plural}`,
				},
				{
					name: `Specific ${resourceLabel}`,
					value: 'resourceId',
					description: `Return only events for a ${resource} with the given ID`,
				},
				{
					name: `Specific ${resourceLabel} and Related Resources`,
					value: 'relatedResourceId',
					description: `Return only events for a ${resource} with the given ID and related resources (${relatedResourcesStr})`,
				},
			],
			description: `Filter events by ${resource} ID`,
		},
		{
			displayName: `${resourceLabel} ID`,
			name: 'resourceId',
			type: 'string',
			default: '',
			validateType: 'number',
			required: true,
			displayOptions: {
				show: {
					resource: [resource],
					resourceFilter: ['resourceId'],
				},
			},
			description: `Return only events for this ${resource}`,
		},
		{
			displayName: `${resourceLabel} ID`,
			name: 'relatedResourceId',
			type: 'string',
			default: '',
			validateType: resource === 'message' ? undefined : 'number',
			required: true,
			displayOptions: {
				show: {
					resource: [resource],
					resourceFilter: ['relatedResourceId'],
				},
			},
			description: `Return only events for this ${resource} and related resources (${relatedResourcesStr})`,
		},
	];
}

// ===================================
// Event Attributes Field
// ===================================

export const eventAttributesField: INodeProperties = {
	displayName: 'Event Attributes to Return',
	hint: 'Select the minimum attributes to improve performance.',
	name: 'eventAttributes',
	type: 'multiOptions',
	default: ['createdAt', 'eventType', 'resourceId', 'resourceType'],
	options: [
		{
			name: 'Audit Data',
			value: 'auditData',
			description: 'Data about the actor that caused the event',
		},
		{
			name: 'Created At',
			value: 'createdAt',
			description: 'The date and time when the event occurred',
		},
		{
			name: 'Event Type',
			value: 'eventType',
			description: 'The type of the event (e.g., listing/created, user/updated)',
		},
		{
			name: 'Marketplace ID',
			value: 'marketplaceId',
			description: 'The ID of the marketplace in which the event happened',
		},
		{
			name: 'Previous Values',
			value: 'previousValues',
			description: 'Previous values for changed resource attributes and relationships',
		},
		{
			name: 'Resource',
			value: 'resource',
			description: 'The full resource data after the event occurred',
		},
		{
			name: 'Resource ID',
			value: 'resourceId',
			description: 'The ID of the API resource that the event is about',
		},
		{
			name: 'Resource Type',
			value: 'resourceType',
			description: 'The type of the API resource (user, listing, transaction, etc.)',
		},
		{
			name: 'Sequence ID',
			value: 'sequenceId',
			description: 'Numeric ID providing strict ordering of events',
		},
		{
			name: 'Source',
			value: 'source',
			description: 'The service from which the event originated',
		},
	],
	description: 'Select which event attributes to include in the response',
};

export const eventAttributesNotice: INodeProperties = {
	displayName: `It is not recommended to return resources in events. Use a filter node then get the resource if it is an event you are interested in.`,
	displayOptions: { show: { eventAttributes: ['resource'] } },
	name: 'notice',
	type: 'notice',
	default: '',
};

// ===================================
// All Properties (Assembled)
// ===================================

export const triggerProperties: INodeProperties[] = [
	resourceField,
	...eventTypeFields,
	...createStartQueryModeFields('all', 'Events'),

	// Start Query Mode for Each Specific Resource
	...createStartQueryModeFields('booking', 'Booking'),
	...createStartQueryModeFields('listing', 'Listing'),
	...createStartQueryModeFields('message', 'Message'),
	...createStartQueryModeFields('review', 'Review'),
	...createStartQueryModeFields('transaction', 'Transaction'),
	...createStartQueryModeFields('user', 'User'),

	// Resource Filtering for Each Resource
	...createResourceFilterFields('listing', 'Listing', [
		'author',
		'bookings',
		'stockReservation',
		'transactions',
	]),
	...createResourceFilterFields('user', 'User', [
		'listings',
		'messages',
		'reviews',
		'transactions',
	]),
	...createResourceFilterFields('transaction', 'Transaction', [
		'booking',
		'customer',
		'listing',
		'messages',
		'provider',
		'reviews',
		'stockReservation',
	]),
	...createResourceFilterFields('message', 'Message', ['sender', 'transaction']),
	...createResourceFilterFields('booking', 'Booking', ['listing', 'transaction']),
	...createResourceFilterFields('review', 'Review', [
		'author',
		'listing',
		'subject',
		'transaction',
	]),

	// Event Attributes
	eventAttributesField,
	eventAttributesNotice,
];
