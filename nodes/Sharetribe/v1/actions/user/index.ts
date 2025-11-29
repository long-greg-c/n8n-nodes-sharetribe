import type { INodeProperties } from 'n8n-workflow';

import * as get from './get';
import * as updateProfile from './update';
import * as updatePermissions from './updatePermissions';
import * as approveUser from './approve';
import * as getMany from './getMany';

export { get, updateProfile, updatePermissions, approveUser, getMany };

export const descriptions: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['user'],
			},
		},
		options: [
			{
				name: 'Approve',
				value: 'approveUser',
				description: 'Approve user currently in <code>pendingApproval</code> state',
				action: 'Approve',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve a user by ID',
				action: 'Get',
			},
			{
				name: 'Get Many',
				value: 'getMany',
				description: 'Retrieve multiple users with filtering and sorting',
				action: 'Get many',
			},
			{
				name: 'Update',
				value: 'updateProfile',
				description: "Update user's profile information",
				action: 'Update',
			},
			{
				name: 'Update Permissions',
				value: 'updatePermissions',
				description: "Update user's permissions",
				action: 'Update permissions',
			},
		],
		default: 'get',
	},

	...get.description,
	...getMany.description,
	...updateProfile.description,
	...updatePermissions.description,
	...approveUser.description,
];
