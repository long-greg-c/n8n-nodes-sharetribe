import type { ListingProperties } from '../../Interfaces';
import {
	createRelationshipFields,
	createUserAttributesField,
	createResultModeFields,
} from '../../../GenericFunctions';
import { sortDescriptionListing } from './sortDescription';
import { filterDescriptionListing } from './filterDescription';
import { LISTING_RELATIONSHIPS, UI_OPERATIONS, UI_RESOURCES } from '../../../constants';

export const listingQueryDescription: ListingProperties = [
	...createRelationshipFields(UI_OPERATIONS.GET_MANY, UI_RESOURCES.LISTING),
	createUserAttributesField(
		UI_RESOURCES.LISTING,
		UI_OPERATIONS.GET_MANY,
		[LISTING_RELATIONSHIPS.AUTHOR],
		'Author Attributes to Return',
		'Select which attributes to return for the listing author',
	),
	...createResultModeFields(
		UI_RESOURCES.LISTING,
		UI_OPERATIONS.GET_MANY,
		UI_RESOURCES.LISTING,
		'(NOT available for time-based or day-partial availability queries)',
	),
	...filterDescriptionListing,
	...sortDescriptionListing,
];
