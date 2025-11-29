import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import {
	executeSharetribeRequest,
	throwNodeErrorIfNotValidUuid,
} from '../../../GenericFunctions';
import { ENDPOINTS, HTTP_METHODS, UI_RESOURCES } from '../../../constants';

export async function deleteException(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const id = this.getNodeParameter('id', index) as string;
	throwNodeErrorIfNotValidUuid(this, index, id, UI_RESOURCES.AVAILABILITY_EXCEPTIONS);

	const body: IDataObject = {
		id,
	};

	return executeSharetribeRequest(this, HTTP_METHODS.POST, ENDPOINTS.AVAILABILITY_EXCEPTIONS_DELETE, body);
}
