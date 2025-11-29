import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import {
	addExtendedDataFields,
	addStringField,
	addUserAttributesToQueryString,
	buildIncludeAndFieldsParams,
	executeSharetribeRequest,
	normalizeGeolocation,
	normalizeImages,
	normalizePrice,
	parseJsonFields,
} from '../../../GenericFunctions';
import {
	API_RESOURCES,
	ENDPOINTS,
	HTTP_METHODS,
	LISTING_RELATIONSHIPS,
	UI_OPERATIONS,
	UI_RESOURCES,
} from '../../../constants';

const JSON_FIELDS = ['publicData', 'privateData', 'metadata', 'images', 'availabilityPlan'];

export async function create(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	// Get required fixed fields
	const title = this.getNodeParameter('title', index) as string;
	const authorId = this.getNodeParameter('authorId', index) as string;
	const state = this.getNodeParameter('state', index) as string;

	const listingFields = this.getNodeParameter('listingFields', index, {}) as IDataObject;

	this.logger.info(`Raw listingFields: ${JSON.stringify(listingFields, null, 2)}`);

	const parsedFields = parseJsonFields(listingFields, JSON_FIELDS);

	// Build create body
	const body: IDataObject = {
		title,
		authorId,
		state,
	};

	// String fields
	addStringField(body, parsedFields, 'description');

	// Normalized fields
	const geolocation = normalizeGeolocation(parsedFields.geolocation);
	if (geolocation) {
		body.geolocation = geolocation;
	}

	const price = normalizePrice(parsedFields.priceCollection);
	if (price) {
		body.price = price;
	}

	const images = normalizeImages(parsedFields.images);
	if (images !== undefined) {
		body.images = images;
	}

	// Availability plan
	if (parsedFields.availabilityPlan) {
		body.availabilityPlan = parsedFields.availabilityPlan;
	}

	// Extended data fields
	addExtendedDataFields(body, parsedFields);

	this.logger.info(`Final create body: ${JSON.stringify(body, null, 2)}`);

	// Build query string with include and fields params
	const qs: IDataObject = { expand: true };

	const includeOptions = this.getNodeParameter('includeOptions', index, []) as string[];
	const configParams = buildIncludeAndFieldsParams(includeOptions, API_RESOURCES.LISTING);
	Object.assign(qs, configParams);

	// Handle author attributes if author is selected
	addUserAttributesToQueryString(
		this,
		qs,
		includeOptions,
		LISTING_RELATIONSHIPS.AUTHOR,
		UI_RESOURCES.LISTING,
		UI_OPERATIONS.CREATE,
		index,
	);

	return executeSharetribeRequest(this, HTTP_METHODS.POST, ENDPOINTS.LISTINGS_CREATE, body, qs);
}
