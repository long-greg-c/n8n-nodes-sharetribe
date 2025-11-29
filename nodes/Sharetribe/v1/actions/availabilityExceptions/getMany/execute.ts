import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import {
	buildIncludeAndFieldsParams,
	executeSharetribeRequest,
	throwNodeErrorIfNotValidUuid,
	validateAvailabilityExceptionTimeRange,
	convertToUtcIso8601,
} from '../../../GenericFunctions';
import { API_RESOURCES, ENDPOINTS, HTTP_METHODS, UI_RESOURCES } from '../../../constants';
import moment from 'moment';

export async function getMany(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const listingId = this.getNodeParameter('listingId', index) as string;
	throwNodeErrorIfNotValidUuid(this, index, listingId, UI_RESOURCES.LISTING);

	const start = this.getNodeParameter('start', index) as string;
	const end = this.getNodeParameter('end', index) as string;

	const startMoment = moment(start);
	const endMoment = moment(end);
	validateAvailabilityExceptionTimeRange(this, index, startMoment, endMoment);

	const resultMode = this.getNodeParameter('resultMode', index) as string;
	const limit = this.getNodeParameter('limit', index, 100) as number;

	const qs: IDataObject = {
		listingId,
		start: convertToUtcIso8601(start),
		end: convertToUtcIso8601(end),
	};

	const includeOptions = this.getNodeParameter('includeOptions', index, []) as string[];
	const configParams = buildIncludeAndFieldsParams(includeOptions, API_RESOURCES.AVAILABILITY_EXCEPTIONS);
	Object.assign(qs, configParams);

	return executeSharetribeRequest(
		this,
		HTTP_METHODS.GET,
		ENDPOINTS.AVAILABILITY_EXCEPTIONS_QUERY,
		undefined,
		qs,
		index,
		resultMode,
		limit,
	);
}
