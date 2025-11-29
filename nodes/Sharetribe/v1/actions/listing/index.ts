import type { INodeProperties } from 'n8n-workflow';

import * as get from './get';
import * as getMany from './getMany';
import * as create from './create';
import * as update from './update';
import * as close from './close';
import * as open from './open';
import * as approve from './approve';

export { get, getMany, create, update, close, open, approve };

export const descriptions: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['listing'],
			},
		},
		options: [
			{
				name: 'Approve',
				value: 'approve',
				description: 'Approve a listing that is pending approval',
				action: 'Approve',
			},
			{
				name: 'Close',
				value: 'close',
				description: 'Close a listing, making it undiscoverable',
				action: 'Close',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new listing',
				action: 'Create',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve a listing by ID',
				action: 'Get',
			},
			{
				name: 'Get Many',
				value: 'getMany',
				description: 'Retrieve multiple listings with filtering and sorting',
				action: 'Get many',
			},
			{
				name: 'Open',
				value: 'open',
				description: 'Reopen a closed listing',
				action: 'Open',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update listing details',
				action: 'Update',
			},
		],
		default: 'get',
	},

	...get.description,
	...getMany.description,
	...create.description,
	...update.description,
	...close.description,
	...open.description,
	...approve.description,
];
