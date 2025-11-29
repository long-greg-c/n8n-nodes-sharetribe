import { type IExecuteFunctions, type IDataObject, type INodeExecutionData } from 'n8n-workflow';
import {
	buildIncludeAndFieldsParams,
	executeSharetribeRequest,
	throwNodeErrorIfNotValidUuid,
} from '../../../GenericFunctions';
import { API_RESOURCES, ENDPOINTS, HTTP_METHODS, UI_RESOURCES } from '../../../constants';

export async function get(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const userId = this.getNodeParameter('userId', index) as string;

	throwNodeErrorIfNotValidUuid(this, index, userId, UI_RESOURCES.USER);

	const includeOptions = this.getNodeParameter('includeOptions', index, []) as string[];

	const qs: IDataObject = {
		id: userId,
		expand: true,
		...buildIncludeAndFieldsParams(includeOptions, API_RESOURCES.USER),
	};

	return executeSharetribeRequest(this, HTTP_METHODS.GET, ENDPOINTS.USERS_GET, undefined, qs);
}
