import { type IExecuteFunctions, type IDataObject, type INodeExecutionData } from 'n8n-workflow';
import {
	buildIncludeAndFieldsParams,
	executeSharetribeRequest,
	USER_ATTRIBUTE_FIELD_MAP,
	throwNodeErrorIfNotValidUuid,
} from '../../../GenericFunctions';
import { API_RESOURCES, ENDPOINTS, HTTP_METHODS, QUERY_PARAMS, UI_OPERATIONS, UI_RESOURCES, LISTING_RELATIONSHIPS } from '../../../constants';

export async function get(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const listingId = this.getNodeParameter('listingId', index) as string;

	throwNodeErrorIfNotValidUuid(this, index, listingId, UI_RESOURCES.LISTING);

	const qs: IDataObject = {
		id: listingId,
		expand: true,
	};

	const includeOptions = this.getNodeParameter('includeOptions', index, []) as string[];
	const configParams = buildIncludeAndFieldsParams(includeOptions, API_RESOURCES.LISTING);
	Object.assign(qs, configParams);

	// Handle author attributes if author is selected
	if (includeOptions.includes(LISTING_RELATIONSHIPS.AUTHOR)) {
		const authorAttributes = this.getNodeParameter(`userAttributes_${UI_RESOURCES.LISTING}_${UI_OPERATIONS.GET}`, index, []) as string[];
		if (authorAttributes.length > 0) {
			const mappedAttributes = authorAttributes.map(
				(attr) => USER_ATTRIBUTE_FIELD_MAP[attr] || attr,
			);
			qs[QUERY_PARAMS.FIELDS_USER] = ['id', ...mappedAttributes].join(',');
		} else {
			qs[QUERY_PARAMS.FIELDS_USER] = 'id';
		}
	}

	return executeSharetribeRequest(this, HTTP_METHODS.GET, ENDPOINTS.LISTINGS_GET, undefined, qs);
}
