import type { UserProperties } from '../../Interfaces';
import { createRelationshipFields, PROPERTY_NAMES } from '../../../GenericFunctions';
import { UI_OPERATIONS, UI_RESOURCES } from '../../../constants';

export const approveUserDescription: UserProperties = [
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				[PROPERTY_NAMES.RESOURCE]: [UI_RESOURCES.USER],
				[PROPERTY_NAMES.OPERATION]: [UI_OPERATIONS.APPROVE],
			},
		},
		default: '',
		description:
			"Command for approving a user that is currently in pendingApproval state. The user's state is set to active.",
	},
	...createRelationshipFields(UI_OPERATIONS.APPROVE, UI_RESOURCES.USER),
];
