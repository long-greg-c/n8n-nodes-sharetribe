import type { ListingProperties } from '../../Interfaces';
import {
	createRelationshipFields,
	createUserAttributesField,
	PROPERTY_NAMES,
} from '../../../GenericFunctions';
import { LISTING_RELATIONSHIPS, UI_OPERATIONS, UI_RESOURCES } from '../../../constants';

export const listingOpenDescription: ListingProperties = [
	{
		displayName: 'Listing ID',
		name: 'listingId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				[PROPERTY_NAMES.RESOURCE]: [UI_RESOURCES.LISTING],
				[PROPERTY_NAMES.OPERATION]: [UI_OPERATIONS.OPEN],
			},
		},
		default: '',
		description: 'ID of the listing to open',
	},
	...createRelationshipFields(UI_OPERATIONS.OPEN, UI_RESOURCES.LISTING),
	createUserAttributesField(
		UI_RESOURCES.LISTING,
		UI_OPERATIONS.OPEN,
		[LISTING_RELATIONSHIPS.AUTHOR],
		'Author Attributes to Return',
		'Select which attributes to return for the listing author',
	),
];
