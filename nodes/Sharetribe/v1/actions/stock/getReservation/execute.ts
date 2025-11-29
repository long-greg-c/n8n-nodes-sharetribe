import { type IExecuteFunctions, type IDataObject, type INodeExecutionData } from 'n8n-workflow';
import {
	executeSharetribeRequest,
	buildSparseFieldsList,
	buildStockIncludeAndFieldsParams,
	throwNodeErrorIfNotValidUuid,
} from '../../../GenericFunctions';
import { ENDPOINTS, HTTP_METHODS, UI_RESOURCES, STOCK_RELATIONSHIPS } from '../../../constants';

const STOCK_RESERVATION_ATTRIBUTE_KEYS = ['quantity', 'state'];

export async function getReservation(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const stockReservationId = this.getNodeParameter('stockReservationId', index) as string;

	throwNodeErrorIfNotValidUuid(this, index, stockReservationId, UI_RESOURCES.STOCK_RESERVATION);

	const includeOptions = this.getNodeParameter('includeOptions', index, []) as string[];

	const qs: IDataObject = {
		expand: true,
		id: stockReservationId,
	};

	// Handle main stock reservation attributes
	qs['fields.stockReservation'] = buildSparseFieldsList(
		includeOptions,
		STOCK_RESERVATION_ATTRIBUTE_KEYS,
	);

	// Build relationships and fields using shared helper
	const { includeRelationships, qs: relationshipQs } = buildStockIncludeAndFieldsParams(
		this,
		index,
		includeOptions,
		'transaction',
		'stockGetReservation',
	);

	// Merge relationship query params into main qs
	Object.assign(qs, relationshipQs);

	// Handle stock adjustments if selected
	if (includeOptions.includes(STOCK_RELATIONSHIPS.STOCK_ADJUSTMENTS)) {
		includeRelationships.push(STOCK_RELATIONSHIPS.STOCK_ADJUSTMENTS);
	}

	if (includeRelationships.length > 0) {
		qs.include = includeRelationships.join(',');
	}

	return executeSharetribeRequest(
		this,
		HTTP_METHODS.GET,
		ENDPOINTS.STOCK_RESERVATIONS_GET,
		undefined,
		qs,
	);
}
