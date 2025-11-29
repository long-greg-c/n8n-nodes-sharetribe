import type { ListingProperties } from '../../Interfaces';
import {
	createRelationshipFields,
	createUserAttributesField,
	PROPERTY_NAMES,
} from '../../../GenericFunctions';
import { LISTING_RELATIONSHIPS, UI_OPERATIONS, UI_RESOURCES } from '../../../constants';
import {
	availabilityPlanField,
	descriptionField,
	geolocationField,
	imagesField,
	metadataField,
	priceCollectionField,
	privateDataField,
	publicDataField,
	titleField,
} from '../sharedFields';

export const listingUpdateDescription: ListingProperties = [
	{
		displayName: 'Listing ID',
		name: 'listingId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				[PROPERTY_NAMES.RESOURCE]: [UI_RESOURCES.LISTING],
				[PROPERTY_NAMES.OPERATION]: [UI_OPERATIONS.UPDATE],
			},
		},
		default: '',
		description: 'ID of the listing to update',
		hint: 'Add ID before choosing attributes to update',
	},
	...createRelationshipFields(UI_OPERATIONS.UPDATE, UI_RESOURCES.LISTING),
	createUserAttributesField(
		UI_RESOURCES.LISTING,
		UI_OPERATIONS.UPDATE,
		[LISTING_RELATIONSHIPS.AUTHOR],
		'Author Attributes to Return',
		'Select which attributes to return for the listing author',
	),
	{
		displayName: 'Attributes to Update',
		name: 'listingFields',
		type: 'collection',
		placeholder: 'Add attribute',
		displayOptions: {
			show: {
				[PROPERTY_NAMES.RESOURCE]: [UI_RESOURCES.LISTING],
				[PROPERTY_NAMES.OPERATION]: [UI_OPERATIONS.UPDATE],
			},
		},
		default: {},
		options: [
			titleField,
			availabilityPlanField,
			descriptionField,
			geolocationField,
			imagesField,
			metadataField,
			priceCollectionField,
			privateDataField,
			publicDataField,
		],
	},
];
