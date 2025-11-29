import type { AvailabilityExceptionProperties } from '../../Interfaces';
import { PROPERTY_NAMES } from '../../../GenericFunctions';
import { UI_RESOURCES, UI_OPERATIONS } from '../../../constants';

export const availabilityExceptionDeleteDescription: AvailabilityExceptionProperties = [
	{
		displayName: 'Exception ID',
		name: 'id',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: { [PROPERTY_NAMES.RESOURCE]: [UI_RESOURCES.AVAILABILITY_EXCEPTIONS], [PROPERTY_NAMES.OPERATION]: [UI_OPERATIONS.DELETE] },
		},
		description: 'ID of the availability exception to delete',
	},
];
