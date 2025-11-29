import type { UserProperties } from '../../Interfaces';
import { createRelationshipFields, PROPERTY_NAMES } from '../../../GenericFunctions';
import { UI_OPERATIONS, UI_RESOURCES } from '../../../constants';

export const updatePermissionsDescription: UserProperties = [
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				[PROPERTY_NAMES.RESOURCE]: [UI_RESOURCES.USER],
				[PROPERTY_NAMES.OPERATION]: [UI_OPERATIONS.UPDATE_PERMISSIONS],
			},
		},
		default: '',
		description: "User's ID",
	},
	...createRelationshipFields(UI_OPERATIONS.UPDATE_PERMISSIONS, UI_RESOURCES.USER),
	{
		displayName: 'Can Create Listings',
		name: 'canCreateListings',
		type: 'boolean',
		default: true,
		displayOptions: {
			show: {
				[PROPERTY_NAMES.RESOURCE]: [UI_RESOURCES.USER],
				[PROPERTY_NAMES.OPERATION]: [UI_OPERATIONS.UPDATE_PERMISSIONS],
			},
		},
		description: 'Whether this user is allowed to create listings (postListings permission)',
	},

	{
		displayName: 'Can Initiate Transactions',
		name: 'canInitiateTransactions',
		type: 'boolean',
		default: true,
		displayOptions: {
			show: {
				[PROPERTY_NAMES.RESOURCE]: [UI_RESOURCES.USER],
				[PROPERTY_NAMES.OPERATION]: [UI_OPERATIONS.UPDATE_PERMISSIONS],
			},
		},
		description:
			'Whether this user is allowed to initiate transactions (initiateTransactions permission)',
	},

	{
		displayName: 'Can Read Data',
		name: 'canRead',
		type: 'boolean',
		default: true,
		displayOptions: {
			show: {
				[PROPERTY_NAMES.RESOURCE]: [UI_RESOURCES.USER],
				[PROPERTY_NAMES.OPERATION]: [UI_OPERATIONS.UPDATE_PERMISSIONS],
			},
		},
		description: 'Whether this user is allowed to view listings and related data (read permission)',
	},
];
