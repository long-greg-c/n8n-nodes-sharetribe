import { type IExecuteFunctions, type IDataObject, type INodeExecutionData } from 'n8n-workflow';
import {
	buildIncludeAndFieldsParams,
	executeSharetribeRequest,
	throwNodeErrorIfNotValidUuid,
} from '../../../GenericFunctions';
import { API_RESOURCES, ENDPOINTS, HTTP_METHODS, UI_RESOURCES } from '../../../constants';

export async function updatePermissions(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const userId = this.getNodeParameter('userId', index) as string;

	throwNodeErrorIfNotValidUuid(this, index, userId, UI_RESOURCES.USER);

	const body: IDataObject = { id: userId };

	const permissionValue = (flag: boolean) => (flag ? 'permission/allow' : 'permission/deny');

	// Only add fields if user set them
	const canCreateListings = this.getNodeParameter('canCreateListings', index, undefined);
	if (canCreateListings !== undefined) {
		body.postListings = permissionValue(canCreateListings as boolean);
	}

	const canInitiateTransactions = this.getNodeParameter(
		'canInitiateTransactions',
		index,
		undefined,
	);
	if (canInitiateTransactions !== undefined) {
		body.initiateTransactions = permissionValue(canInitiateTransactions as boolean);
	}

	const canRead = this.getNodeParameter('canRead', index, undefined);
	if (canRead !== undefined) {
		body.read = permissionValue(canRead as boolean);
	}

	const qs: IDataObject = { expand: true };

	const includeOptions = this.getNodeParameter('includeOptions', index, []) as string[];
	const includeOptionsParams = buildIncludeAndFieldsParams(includeOptions, API_RESOURCES.USER);
	Object.assign(qs, includeOptionsParams);

	return executeSharetribeRequest(
		this,
		HTTP_METHODS.POST,
		ENDPOINTS.USERS_UPDATE_PERMISSIONS,
		body,
		qs,
	);
}
