import type { ListingProperties } from '../../Interfaces';
import {
	createRelationshipFields,
	createUserAttributesField,
	PROPERTY_NAMES,
} from '../../../GenericFunctions';
import {
	LISTING_RELATIONSHIPS,
	UI_OPERATIONS,
	UI_RESOURCES,
} from '../../../constants';
import {
	availabilityPlanField,
	descriptionField,
	geolocationField,
	imagesField,
	metadataField,
	priceCollectionField,
	privateDataField,
	publicDataField,
} from '../sharedFields';

export const listingCreateDescription: ListingProperties = [
	...createRelationshipFields(UI_OPERATIONS.CREATE, UI_RESOURCES.LISTING),
	createUserAttributesField(
		UI_RESOURCES.LISTING,
		UI_OPERATIONS.CREATE,
		[LISTING_RELATIONSHIPS.AUTHOR],
		'Author Attributes to Return',
		'Select which attributes to return for the listing author',
	),
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				[PROPERTY_NAMES.RESOURCE]: [UI_RESOURCES.LISTING],
				[PROPERTY_NAMES.OPERATION]: [UI_OPERATIONS.CREATE],
			},
		},
		default: '',
		description: 'Title of the listing',
	},
	{
		displayName: 'Author ID',
		name: 'authorId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				[PROPERTY_NAMES.RESOURCE]: [UI_RESOURCES.LISTING],
				[PROPERTY_NAMES.OPERATION]: [UI_OPERATIONS.CREATE],
			},
		},
		default: '',
		description: 'ID of the user to whom the listing belongs',
	},
	{
		displayName: 'State',
		name: 'state',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				[PROPERTY_NAMES.RESOURCE]: [UI_RESOURCES.LISTING],
				[PROPERTY_NAMES.OPERATION]: [UI_OPERATIONS.CREATE],
			},
		},
		options: [
			{
				name: 'Pending Approval',
				value: 'pendingApproval',
			},
			{
				name: 'Published',
				value: 'published',
			},
		],
		default: 'pendingApproval',
		description: 'State of the listing',
	},
	{
		displayName: 'Optional Attributes',
		name: 'listingFields',
		type: 'collection',
		placeholder: 'Add attribute',
		displayOptions: {
			show: {
				[PROPERTY_NAMES.RESOURCE]: [UI_RESOURCES.LISTING],
				[PROPERTY_NAMES.OPERATION]: [UI_OPERATIONS.CREATE],
			},
		},
		default: {},
		options: [
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
