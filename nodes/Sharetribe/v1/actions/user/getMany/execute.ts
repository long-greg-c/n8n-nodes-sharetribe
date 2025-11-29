import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import {
	buildIncludeAndFieldsParams,
	executeSharetribeRequest,
	addFiltersToQueryParams,
	formatSortParameter,
} from '../../../GenericFunctions';
import { API_RESOURCES, ENDPOINTS, HTTP_METHODS } from '../../../constants';

export async function getMany(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const resultMode = this.getNodeParameter('resultMode', index) as string;
	const limit = this.getNodeParameter('limit', index, 50) as number;
	const filterOptions = this.getNodeParameter('filterOptions', index, {}) as IDataObject;
	const sortOptions = this.getNodeParameter('sort', index, {}) as IDataObject;

	const qs: IDataObject = { expand: true };

	const includeOptions = this.getNodeParameter('includeOptions', index, []) as string[];
	const includeOptionsParams = buildIncludeAndFieldsParams(includeOptions, API_RESOURCES.USER);
	Object.assign(qs, includeOptionsParams);

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
		ENDPOINTS.USERS_QUERY,
		undefined,
		qs,
		index,
		resultMode,
		limit,
	);
}
