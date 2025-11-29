import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import {
	buildIncludeAndFieldsParams,
	executeSharetribeRequest,
	USER_ATTRIBUTE_FIELD_MAP,
	addFiltersToQueryParams,
	applyListingSpecificFilters,
	handleExtendedDataSort,
} from '../../../GenericFunctions';
import {
	API_RESOURCES,
	ENDPOINTS,
	HTTP_METHODS,
	QUERY_PARAMS,
	LISTING_RELATIONSHIPS,
	UI_OPERATIONS,
	UI_RESOURCES,
} from '../../../constants';

export async function query(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const resultMode = this.getNodeParameter('resultMode', itemIndex) as string;
	const limit = this.getNodeParameter('limit', itemIndex, 50) as number;
	const filterOptions = this.getNodeParameter('filterOptions', itemIndex, {}) as IDataObject;
	const sortOptions = this.getNodeParameter('sort', itemIndex, {}) as IDataObject;

	const qs: IDataObject = {
		expand: true,
	};

	const includeOptions = this.getNodeParameter('includeOptions', itemIndex, []) as string[];
	const configParams = buildIncludeAndFieldsParams(includeOptions, API_RESOURCES.LISTING);
	Object.assign(qs, configParams);

	// Handle author attributes if author is selected
	if (includeOptions.includes(LISTING_RELATIONSHIPS.AUTHOR)) {
		const authorAttributes = this.getNodeParameter(
			`userAttributes_${UI_RESOURCES.LISTING}_${UI_OPERATIONS.GET_MANY}`,
			itemIndex,
			[],
		) as string[];
		if (authorAttributes.length > 0) {
			const mappedAttributes = authorAttributes.map(
				(attr) => USER_ATTRIBUTE_FIELD_MAP[attr] || attr,
			);
			qs[QUERY_PARAMS.FIELDS_USER] = ['id', ...mappedAttributes].join(',');
		} else {
			// If author is included but no specific attributes selected, only return id
			qs[QUERY_PARAMS.FIELDS_USER] = 'id';
		}
	}

	// Handle filters
	if (filterOptions.filters) {
		for (const filter of filterOptions.filters as IDataObject[]) {
			// Apply generic filters (createdAt, states, etc.)
			addFiltersToQueryParams([filter], qs, this.getNode());

			// Apply listing-specific filters
			applyListingSpecificFilters(filter, qs);
		}
	}

	// Check if keywords or location filter is being used
	const hasKeywordsFilter =
		filterOptions.filters &&
		(filterOptions.filters as IDataObject[]).some(
			(filter) => filter.filterType === 'keywords' && filter.keywords,
		);

	const hasLocationFilter =
		filterOptions.filters &&
		(filterOptions.filters as IDataObject[]).some(
			(filter) => filter.filterType === 'location' && filter.origin,
		);

	// Handle sorting with special keywords/location handling
	if (sortOptions.sort) {
		const sortArray = (sortOptions.sort as IDataObject[])
			.map((sortRule) => {
				const field = sortRule.field as string;
				const direction = (sortRule.direction as string) || 'ASC';

				// When keywords filter is used, filter out location sorting as they're mutually exclusive
				if (hasKeywordsFilter && field === 'location') {
					return null; // Will be filtered out
				}

				return handleExtendedDataSort(sortRule, field, direction);
			})
			.filter(Boolean); // Remove null values

		// If keywords filter is used but no keywords sort is specified, add keywords as primary sort
		if (hasKeywordsFilter && !sortArray.some((sort) => sort?.includes('keywords'))) {
			sortArray.unshift('keywords'); // Add keywords as first/primary sort
		}
		// If location filter is used but no location sort is specified, add location as primary sort
		else if (
			hasLocationFilter &&
			!hasKeywordsFilter &&
			!sortArray.some((sort) => sort?.includes('location'))
		) {
			sortArray.unshift('location'); // Add location as first/primary sort
		}

		if (sortArray.length > 0) {
			qs.sort = sortArray.join(',');
		}
	} else if (hasKeywordsFilter) {
		// If no sort specified but keywords filter is used, default to keywords sorting
		qs.sort = 'keywords';
	} else if (hasLocationFilter) {
		// If no sort specified but location filter is used, default to location sorting
		qs.sort = 'location';
	}

	// Check for availability filtering that doesn't support pagination
	const hasAvailabilityFilter =
		filterOptions.filters &&
		(filterOptions.filters as IDataObject[]).some(
			(filter) => filter.filterType === 'availability' && filter.availabilityOptions,
		);

	let hasLimitingAvailabilityQuery = false;
	if (hasAvailabilityFilter) {
		const availabilityFilters = (filterOptions.filters as IDataObject[]).filter(
			(f) => f.filterType === 'availability' && f.availabilityOptions,
		);

		for (const filter of availabilityFilters) {
			const availOptions = filter.availabilityOptions as IDataObject;
			const settings = availOptions.settings as IDataObject;

			if (settings) {
				const availType = settings.availabilityType as string;
				const minDuration = settings.minDuration as number;

				// Time-based queries or day-partial with minDuration don't support pagination
				if (
					availType?.includes('time-') ||
					(availType === 'day-partial' && minDuration && minDuration > 0)
				) {
					hasLimitingAvailabilityQuery = true;
					break;
				}
			}
		}
	}

	return executeSharetribeRequest(
		this,
		HTTP_METHODS.GET,
		ENDPOINTS.LISTINGS_QUERY,
		undefined,
		qs,
		itemIndex,
		resultMode,
		limit,
		{
			forceLimitedQuery: hasLimitingAvailabilityQuery,
			maxLimit: 100,
		},
	);
}
