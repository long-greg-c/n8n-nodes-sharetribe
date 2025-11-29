import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import {
	executeSharetribeRequest,
	throwNodeErrorIfNotValidUuid,
	validatePositiveInteger,
} from '../../../GenericFunctions';
import { ENDPOINTS, HTTP_METHODS, UI_RESOURCES } from '../../../constants';

export async function compareAndSet(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const listingId = this.getNodeParameter('listingId', index) as string;

	throwNodeErrorIfNotValidUuid(this, index, listingId, UI_RESOURCES.LISTING);

	const oldTotal = this.getNodeParameter('oldTotal', index, null) as number | null;
	const newTotal = this.getNodeParameter('newTotal', index) as number;

	// oldTotal can be null (for listings with no stock defined), but if it's a number, must be non-negative integer
	if (oldTotal !== null) {
		validatePositiveInteger(this, index, oldTotal, 'current total stock');
	}

	// newTotal must always be non-negative integer
	validatePositiveInteger(this, index, newTotal, 'new total stock');

	const body: IDataObject = {
		listingId,
		oldTotal,
		newTotal,
	};

	return executeSharetribeRequest(this, HTTP_METHODS.POST, ENDPOINTS.STOCK_COMPARE_AND_SET, body);
}
