import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import {
	executeSharetribeRequest,
	throwNodeErrorIfNotValidUuid,
	validateAvailabilityExceptionTimeRange,
	validatePositiveInteger,
	convertToUtcIso8601,
} from '../../../GenericFunctions';
import { ENDPOINTS, HTTP_METHODS, UI_RESOURCES } from '../../../constants';
import moment from 'moment';

export async function create(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const listingId = this.getNodeParameter('listingId', index) as string;
	throwNodeErrorIfNotValidUuid(this, index, listingId, UI_RESOURCES.LISTING);

	const start = this.getNodeParameter('start', index) as string;
	const end = this.getNodeParameter('end', index) as string;

	const startMoment = moment(start);
	const endMoment = moment(end);
	validateAvailabilityExceptionTimeRange(this, index, startMoment, endMoment);

	const seats = this.getNodeParameter('seats', index) as number;
	validatePositiveInteger(this, index, seats, 'seats');

	const body: IDataObject = {
		listingId,
		start: convertToUtcIso8601(start),
		end: convertToUtcIso8601(end),
		seats,
	};

	return executeSharetribeRequest(
		this,
		HTTP_METHODS.POST,
		ENDPOINTS.AVAILABILITY_EXCEPTIONS_CREATE,
		body,
	);
}
