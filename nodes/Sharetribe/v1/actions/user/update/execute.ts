import { type IExecuteFunctions, type IDataObject, type INodeExecutionData } from 'n8n-workflow';
import {
	addStringField,
	buildIncludeAndFieldsParams,
	executeSharetribeRequest,
	parseJsonFields,
	throwNodeErrorIfNotValidUuid,
} from '../../../GenericFunctions';
import { API_RESOURCES, ENDPOINTS, HTTP_METHODS, UI_RESOURCES } from '../../../constants';

const JSON_FIELDS = ['publicData', 'protectedData', 'privateData', 'metadata'];

export async function updateProfile(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const userId = this.getNodeParameter('userId', index) as string;

	throwNodeErrorIfNotValidUuid(this, index, userId, UI_RESOURCES.USER);

	const profileFields = this.getNodeParameter('profileFields', index, {}) as IDataObject;

	this.logger.info(`Raw profileFields: ${JSON.stringify(profileFields, null, 2)}`);

	const parsedFields = parseJsonFields(profileFields, JSON_FIELDS);

	// Build update body
	const body: IDataObject = { id: userId };

	// String fields
	addStringField(body, parsedFields, 'firstName');
	addStringField(body, parsedFields, 'lastName');
	addStringField(body, parsedFields, 'displayName');
	addStringField(body, parsedFields, 'bio');
	addStringField(body, parsedFields, 'profileImageId');

	// Extended data fields (publicData, protectedData, privateData, metadata)
	if (parsedFields.publicData) {
		body.publicData = parsedFields.publicData;
	}
	if (parsedFields.protectedData) {
		body.protectedData = parsedFields.protectedData;
	}
	if (parsedFields.privateData) {
		body.privateData = parsedFields.privateData;
	}
	if (parsedFields.metadata) {
		body.metadata = parsedFields.metadata;
	}

	this.logger.info(`Final update body: ${JSON.stringify(body, null, 2)}`);

	const qs: IDataObject = { expand: true };

	const includeOptions = this.getNodeParameter('includeOptions', index, []) as string[];
	const includeOptionsParams = buildIncludeAndFieldsParams(includeOptions, API_RESOURCES.USER);
	Object.assign(qs, includeOptionsParams);

	return executeSharetribeRequest(
		this,
		HTTP_METHODS.POST,
		ENDPOINTS.USERS_UPDATE_PROFILE,
		body,
		qs,
	);
}
