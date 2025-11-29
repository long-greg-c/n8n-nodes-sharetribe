import type { UserProperties } from '../../Interfaces';
import { createRelationshipFields, PROPERTY_NAMES } from '../../../GenericFunctions';
import { UI_OPERATIONS, UI_RESOURCES } from '../../../constants';
import {
	bioField,
	displayNameField,
	firstNameField,
	lastNameField,
	profileImageIdField,
	userMetadataField,
	userPrivateDataField,
	userProtectedDataField,
	userPublicDataField,
} from '../sharedFields';

export const updateProfileDescription: UserProperties = [
	{
		displayName: 'ID of User to Update',
		name: 'userId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				[PROPERTY_NAMES.RESOURCE]: [UI_RESOURCES.USER],
				[PROPERTY_NAMES.OPERATION]: [UI_OPERATIONS.UPDATE_PROFILE],
			},
		},
		default: '',
	},
	...createRelationshipFields(UI_OPERATIONS.UPDATE_PROFILE, UI_RESOURCES.USER),
	{
		displayName: 'Attributes to Update',
		name: 'profileFields',
		type: 'collection',
		placeholder: 'Add attribute to update',
		displayOptions: {
			show: {
				[PROPERTY_NAMES.RESOURCE]: [UI_RESOURCES.USER],
				[PROPERTY_NAMES.OPERATION]: [UI_OPERATIONS.UPDATE_PROFILE],
			},
		},
		default: {},
		options: [
			bioField,
			displayNameField,
			firstNameField,
			lastNameField,
			profileImageIdField,
			userMetadataField,
			userPrivateDataField,
			userProtectedDataField,
			userPublicDataField,
		],
	},
];
