import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import {
	executeSharetribeRequest,
	throwNodeErrorIfNotValidUuid,
	validateStockAdjustmentQuantity,
} from '../../../GenericFunctions';
import { ENDPOINTS, HTTP_METHODS, UI_RESOURCES } from '../../../constants';

export async function adjust(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const listingId = this.getNodeParameter('listingId', index) as string;
	throwNodeErrorIfNotValidUuid(this, index, listingId, UI_RESOURCES.LISTING);

	const quantity = this.getNodeParameter('quantity', index) as number;
	validateStockAdjustmentQuantity(this, index, quantity);

	const body: IDataObject = {
		listingId,
		quantity,
	};

	// Always include the result as per documentation
	const qs: IDataObject = {
		include: 'result',
	};

	return executeSharetribeRequest(
		this,
		HTTP_METHODS.POST,
		ENDPOINTS.STOCK_ADJUSTMENTS_CREATE,
		body,
		qs,
	);
}
