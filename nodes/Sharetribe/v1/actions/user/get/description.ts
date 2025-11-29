import type { UserProperties } from '../../Interfaces';
import { createRelationshipFields, PROPERTY_NAMES } from '../../../GenericFunctions';
import { UI_OPERATIONS, UI_RESOURCES } from '../../../constants';

export const userGetDescription: UserProperties = [
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				[PROPERTY_NAMES.RESOURCE]: [UI_RESOURCES.USER],
				[PROPERTY_NAMES.OPERATION]: [UI_OPERATIONS.GET],
			},
		},
		default: '',
		description: "User's ID",
	},

	...createRelationshipFields(UI_OPERATIONS.GET, UI_RESOURCES.USER),
];
