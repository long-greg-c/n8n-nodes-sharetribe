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
	throwNodeErrorIfNotValidUuid,
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

export async function update(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const listingId = this.getNodeParameter('listingId', index) as string;

	throwNodeErrorIfNotValidUuid(this, index, listingId, UI_RESOURCES.LISTING);

	const listingFields = this.getNodeParameter('listingFields', index, {}) as IDataObject;

	this.logger.info(`Raw listingFields: ${JSON.stringify(listingFields, null, 2)}`);

	const parsedFields = parseJsonFields(listingFields, JSON_FIELDS);

	// Build update body
	const body: IDataObject = { id: listingId };

	// String fields
	addStringField(body, parsedFields, 'title');
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

	this.logger.info(`Final update body: ${JSON.stringify(body, null, 2)}`);

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
		UI_OPERATIONS.UPDATE,
		index,
	);

	return executeSharetribeRequest(this, HTTP_METHODS.POST, ENDPOINTS.LISTINGS_UPDATE, body, qs);
}
