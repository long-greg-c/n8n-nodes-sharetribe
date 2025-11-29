import { type IExecuteFunctions, type IDataObject, type INodeExecutionData } from 'n8n-workflow';
import { executeSharetribeRequest, throwNodeErrorIfNotValidUuid } from '../../../GenericFunctions';
import { ENDPOINTS, HTTP_METHODS, UI_RESOURCES } from '../../../constants';

export async function updateMetadata(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const transactionId = this.getNodeParameter('transactionId', index) as string;

	throwNodeErrorIfNotValidUuid(this, index, transactionId, UI_RESOURCES.TRANSACTION);

	const metadataString = this.getNodeParameter('metadata', index) as string;

	let metadata: IDataObject;
	try {
		metadata = JSON.parse(metadataString);
	} catch (err) {
		throw new Error(`Metadata is not valid JSON: ${(err as Error).message}`);
	}

	const body: IDataObject = {
		id: transactionId,
		metadata,
	};

	const qs: IDataObject = { expand: true };

	return executeSharetribeRequest(
		this,
		HTTP_METHODS.POST,
		ENDPOINTS.TRANSACTIONS_UPDATE_METADATA,
		body,
		qs,
	);
}
