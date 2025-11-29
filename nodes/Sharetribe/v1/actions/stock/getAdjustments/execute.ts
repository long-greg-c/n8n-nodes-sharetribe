import {
	type IExecuteFunctions,
	type IDataObject,
	type INodeExecutionData,
} from 'n8n-workflow';
import {
	buildSparseFieldsList,
	buildStockIncludeAndFieldsParams,
	executeSharetribeRequest,
	throwNodeErrorIfNotValidUuid,
	validateStockAdjustmentTimeRange,
	convertToUtcIso8601,
} from '../../../GenericFunctions';
import { ENDPOINTS, HTTP_METHODS, UI_RESOURCES, STOCK_RELATIONSHIPS } from '../../../constants';

const STOCK_ADJUSTMENT_ATTRIBUTE_KEYS = ['at', 'quantity'];

export async function query(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const listingId = this.getNodeParameter('listingId', index) as string;
	throwNodeErrorIfNotValidUuid(this, index, listingId, UI_RESOURCES.LISTING);

	const startStr = this.getNodeParameter('start', index) as string;
	const endStr = this.getNodeParameter('end', index) as string;
	validateStockAdjustmentTimeRange(this, index, startStr, endStr);

	const start = convertToUtcIso8601(startStr);
	const end = convertToUtcIso8601(endStr);
	const includeOptions = this.getNodeParameter('includeOptions', index, []) as string[];
	const resultMode = this.getNodeParameter('resultMode', index, 'limit') as string;
	const limit = this.getNodeParameter('limit', index, 50) as number;

	const qs: IDataObject = {
		expand: true,
		listingId,
		start,
		end,
	};

	// Handle main stock adjustment attributes
	qs['fields.stockAdjustment'] = buildSparseFieldsList(
		includeOptions,
		STOCK_ADJUSTMENT_ATTRIBUTE_KEYS,
	);

	// Build relationships and fields using shared helper
	const { includeRelationships, qs: relationshipQs } = buildStockIncludeAndFieldsParams(
		this,
		index,
		includeOptions,
		STOCK_RELATIONSHIPS.STOCK_RESERVATION_TRANSACTION,
		'stockQuery',
	);

	// Merge relationship query params into main qs
	Object.assign(qs, relationshipQs);

	// Handle stock reservation if selected (separate from transaction)
	if (includeOptions.includes(STOCK_RELATIONSHIPS.STOCK_RESERVATION)) {
		includeRelationships.push(STOCK_RELATIONSHIPS.STOCK_RESERVATION);
	}

	if (includeRelationships.length > 0) {
		qs.include = includeRelationships.join(',');
	}

	return executeSharetribeRequest(
		this,
		HTTP_METHODS.GET,
		ENDPOINTS.STOCK_ADJUSTMENTS_QUERY,
		undefined,
		qs,
		index,
		resultMode,
		limit,
	);
}
