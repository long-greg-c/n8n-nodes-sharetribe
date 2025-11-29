import { type IExecuteFunctions, type IDataObject, type INodeExecutionData } from 'n8n-workflow';
import {
	buildIncludeAndFieldsParams,
	executeSharetribeRequest,
	throwNodeErrorIfNotValidUuid,
} from '../../../GenericFunctions';
import { API_RESOURCES, ENDPOINTS, HTTP_METHODS, UI_RESOURCES } from '../../../constants';

export async function approveUser(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const userId = this.getNodeParameter('userId', index) as string;

	throwNodeErrorIfNotValidUuid(this, index, userId, UI_RESOURCES.USER);

	const body: IDataObject = { id: userId };

	const qs: IDataObject = { expand: true };

	const includeOptions = this.getNodeParameter('includeOptions', index, []) as string[];
	const includeOptionsParams = buildIncludeAndFieldsParams(includeOptions, API_RESOURCES.USER);
	Object.assign(qs, includeOptionsParams);

	return executeSharetribeRequest(this, HTTP_METHODS.POST, ENDPOINTS.USERS_APPROVE, body, qs);
}
