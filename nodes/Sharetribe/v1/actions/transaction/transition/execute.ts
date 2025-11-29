import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import {
	executeSharetribeRequest,
	throwNodeErrorIfNotValidUuid,
	getResourceLocatorValue,
} from '../../../GenericFunctions';
import { ENDPOINTS, HTTP_METHODS, UI_RESOURCES } from '../../../constants';

export async function transition(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const transactionId = this.getNodeParameter('transactionId', index) as string;

	throwNodeErrorIfNotValidUuid(this, index, transactionId, UI_RESOURCES.TRANSACTION);

	const transitionRaw = this.getNodeParameter('transition', index);
	const transition = getResourceLocatorValue(transitionRaw);

	// TODO: validate transition name with a slash in the middle?
	if (!transition) {
		throw new NodeOperationError(this.getNode(), 'Transition name is required');
	}

	const body: IDataObject = {
		id: transactionId,
		transition,
	};

	const qs: IDataObject = { expand: true };

	return executeSharetribeRequest(
		this,
		HTTP_METHODS.POST,
		ENDPOINTS.TRANSACTIONS_TRANSITION,
		body,
		qs,
	);
}
