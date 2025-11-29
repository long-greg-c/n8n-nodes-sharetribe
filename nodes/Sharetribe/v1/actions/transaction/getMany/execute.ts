import { type IExecuteFunctions, type IDataObject, type INodeExecutionData } from 'n8n-workflow';

import {
	buildIncludeAndFieldsParams,
	executeSharetribeRequest,
	addFiltersToQueryParams,
	formatSortParameter,
	USER_ATTRIBUTE_FIELD_MAP,
} from '../../../GenericFunctions';
import {
	API_RESOURCES,
	ENDPOINTS,
	HTTP_METHODS,
	QUERY_PARAMS,
	TRANSACTION_RELATIONSHIPS,
	UI_OPERATIONS,
	UI_RESOURCES,
} from '../../../constants';

export async function query(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const resultMode = this.getNodeParameter('resultMode', index) as string;
	const limit = this.getNodeParameter('limit', index, 50) as number;
	const filterOptions = this.getNodeParameter('filterOptions', index, {}) as IDataObject;
	const sortOptions = this.getNodeParameter('sort', index, {}) as IDataObject;

	const qs: IDataObject = {
		expand: true,
	};

	const includeOptions = this.getNodeParameter('includeOptions', index, []) as string[];
	const configParams = buildIncludeAndFieldsParams(includeOptions, API_RESOURCES.TRANSACTION);
	Object.assign(qs, configParams);

	//TODO: need to handle multiple filters of the same type where its allowed, like process names, maybe fixed collection where in the ui the user can add another resource locator to the same filter?

	// Handle user attributes if customer or provider is selected
	if (
		includeOptions.includes(TRANSACTION_RELATIONSHIPS.CUSTOMER) ||
		includeOptions.includes(TRANSACTION_RELATIONSHIPS.PROVIDER)
	) {
		const userAttributes = this.getNodeParameter(
			`userAttributes_${UI_RESOURCES.TRANSACTION}_${UI_OPERATIONS.GET_MANY}`,
			index,
			[],
		) as string[];
		if (userAttributes.length > 0) {
			const mappedAttributes = userAttributes.map((attr) => USER_ATTRIBUTE_FIELD_MAP[attr] || attr);
			qs[QUERY_PARAMS.FIELDS_USER] = ['id', ...mappedAttributes].join(',');
		} else {
			qs[QUERY_PARAMS.FIELDS_USER] = 'id';
		}
	}

	// Handle listing attributes if listing is selected
	if (includeOptions.includes(TRANSACTION_RELATIONSHIPS.LISTING)) {
		const listingAttributes = this.getNodeParameter(
			`listingAttributes_${UI_RESOURCES.TRANSACTION}_${UI_OPERATIONS.GET_MANY}`,
			index,
			[],
		) as string[];
		if (listingAttributes.length > 0) {
			qs[QUERY_PARAMS.FIELDS_LISTING] = ['id', ...listingAttributes].join(',');
		} else {
			qs[QUERY_PARAMS.FIELDS_LISTING] = 'id';
		}
	}

	// Handle filters
	if (filterOptions.filters) {
		addFiltersToQueryParams(filterOptions.filters as IDataObject[], qs, this.getNode());
	}

	// Handle sorting
	const sortString = formatSortParameter(sortOptions);
	if (sortString) {
		qs.sort = sortString;
	}

	return executeSharetribeRequest(
		this,
		HTTP_METHODS.GET,
		ENDPOINTS.TRANSACTIONS_QUERY,
		undefined,
		qs,
		index,
		resultMode,
		limit,
	);
}
