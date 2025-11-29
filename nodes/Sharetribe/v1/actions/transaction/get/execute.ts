import { type IExecuteFunctions, type IDataObject, type INodeExecutionData } from 'n8n-workflow';
import {
	buildIncludeAndFieldsParams,
	executeSharetribeRequest,
	USER_ATTRIBUTE_FIELD_MAP,
	throwNodeErrorIfNotValidUuid,
} from '../../../GenericFunctions';
import { API_RESOURCES, ENDPOINTS, HTTP_METHODS, QUERY_PARAMS, UI_OPERATIONS, UI_RESOURCES, TRANSACTION_RELATIONSHIPS } from '../../../constants';

export async function get(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const transactionId = this.getNodeParameter('transactionId', index) as string;

	throwNodeErrorIfNotValidUuid(this, index, transactionId, UI_RESOURCES.TRANSACTION);

	const qs: IDataObject = {
		id: transactionId,
		expand: true,
	};

	const includeOptions = this.getNodeParameter('includeOptions', index, []) as string[];
	const configParams = buildIncludeAndFieldsParams(includeOptions, API_RESOURCES.TRANSACTION);
	Object.assign(qs, configParams);

	// Handle user attributes if customer or provider is selected
	if (includeOptions.includes(TRANSACTION_RELATIONSHIPS.CUSTOMER) || includeOptions.includes(TRANSACTION_RELATIONSHIPS.PROVIDER)) {
		const userAttributes = this.getNodeParameter(`userAttributes_${UI_RESOURCES.TRANSACTION}_${UI_OPERATIONS.GET}`, index, []) as string[];
		if (userAttributes.length > 0) {
			const mappedAttributes = userAttributes.map((attr) => USER_ATTRIBUTE_FIELD_MAP[attr] || attr);
			qs[QUERY_PARAMS.FIELDS_USER] = ['id', ...mappedAttributes].join(',');
		} else {
			qs[QUERY_PARAMS.FIELDS_USER] = 'id';
		}
	}

	// Handle listing attributes if listing is selected
	if (includeOptions.includes(TRANSACTION_RELATIONSHIPS.LISTING)) {
		const listingAttributes = this.getNodeParameter(`listingAttributes_${UI_RESOURCES.TRANSACTION}_${UI_OPERATIONS.GET}`, index, []) as string[];
		if (listingAttributes.length > 0) {
			qs[QUERY_PARAMS.FIELDS_LISTING] = ['id', ...listingAttributes].join(',');
		} else {
			qs[QUERY_PARAMS.FIELDS_LISTING] = 'id';
		}
	}

	return executeSharetribeRequest(
		this,
		HTTP_METHODS.GET,
		ENDPOINTS.TRANSACTIONS_GET,
		undefined,
		qs,
	);
}
