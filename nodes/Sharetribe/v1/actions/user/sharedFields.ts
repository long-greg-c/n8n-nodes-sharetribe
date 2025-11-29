import type { INodeProperties } from 'n8n-workflow';
import {
	metadataField,
	privateDataField,
	protectedDataField,
	publicDataField,
} from '../../GenericFunctions';

export const bioField: INodeProperties = {
	displayName: 'Bio',
	name: 'bio',
	type: 'string',
	default: '',
	description: 'User bio',
};

export const displayNameField: INodeProperties = {
	displayName: 'Display Name',
	name: 'displayName',
	type: 'string',
	default: '',
	description: 'Display name for the user',
};

export const firstNameField: INodeProperties = {
	displayName: 'First Name',
	name: 'firstName',
	type: 'string',
	default: '',
	description: 'First name of the user',
};

export const lastNameField: INodeProperties = {
	displayName: 'Last Name',
	name: 'lastName',
	type: 'string',
	default: '',
	description: 'Last name of the user',
};

export const profileImageIdField: INodeProperties = {
	displayName: 'Profile Image ID',
	name: 'profileImageId',
	type: 'string',
	default: '',
	description: 'ID of an uploaded image',
};

// Re-export shared extended data fields with user-specific aliases
export {
	publicDataField as userPublicDataField,
	protectedDataField as userProtectedDataField,
	privateDataField as userPrivateDataField,
	metadataField as userMetadataField,
};
