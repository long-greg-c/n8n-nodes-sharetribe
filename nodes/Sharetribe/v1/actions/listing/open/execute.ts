import { type IExecuteFunctions, type IDataObject, type INodeExecutionData } from 'n8n-workflow';
import { executeSharetribeRequest, throwNodeErrorIfNotValidUuid } from '../../../GenericFunctions';
import { ENDPOINTS, HTTP_METHODS, UI_RESOURCES } from '../../../constants';

export async function open(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const listingId = this.getNodeParameter('listingId', index) as string;

	throwNodeErrorIfNotValidUuid(this, index, listingId, UI_RESOURCES.LISTING);

	const body: IDataObject = { id: listingId };

	const qs: IDataObject = { expand: true };

	return executeSharetribeRequest(this, HTTP_METHODS.POST, ENDPOINTS.LISTINGS_OPEN, body, qs);
}
