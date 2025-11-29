import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { executeSharetribeRequest } from '../../../GenericFunctions';
import { ENDPOINTS, HTTP_METHODS } from '../../../constants';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function get(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const qs = { expand: true };
	return executeSharetribeRequest(this, HTTP_METHODS.GET, ENDPOINTS.MARKETPLACE_GET, undefined, qs);
}
