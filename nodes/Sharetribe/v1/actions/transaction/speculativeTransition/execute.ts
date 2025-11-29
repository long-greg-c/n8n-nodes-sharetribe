import { type IExecuteFunctions, type IDataObject, type INodeExecutionData } from 'n8n-workflow';
import { ENDPOINTS, HTTP_METHODS, UI_RESOURCES } from '../../../constants';
import { throwNodeErrorIfNotValidUuid, executeSharetribeRequest } from '../../../GenericFunctions';

export async function speculativeTransition(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const transactionId = this.getNodeParameter('transactionId', index) as string;

	throwNodeErrorIfNotValidUuid(this, index, transactionId, UI_RESOURCES.TRANSACTION);

	const transition = this.getNodeParameter('transition', index) as string;
	const metadata = this.getNodeParameter('metadata', index, '{}') as string;

	let parsedMetadata: IDataObject = {};
	try {
		parsedMetadata = JSON.parse(metadata);
	} catch (error) {
		throw new Error(`Invalid JSON in metadata: ${error.message}`);
	}

	const body: IDataObject = {
		id: transactionId,
		transition,
		...parsedMetadata,
	};

	return executeSharetribeRequest(this, HTTP_METHODS.POST, ENDPOINTS.TRANSACTIONS_SPECULATIVE_TRANSITION, body);
}
