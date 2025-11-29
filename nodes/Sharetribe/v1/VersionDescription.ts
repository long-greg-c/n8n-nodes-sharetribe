/* eslint-disable n8n-nodes-base/node-filename-against-convention */
import { NodeConnectionTypes, type INodeTypeDescription } from 'n8n-workflow';

import * as user from './actions/user';
import * as listing from './actions/listing';
import * as transaction from './actions/transaction';
import * as marketplace from './actions/marketplace';
import * as image from './actions/image';
import * as stock from './actions/stock';
import * as availabilityExceptions from './actions/availabilityExceptions';

export const VersionDescription: INodeTypeDescription = {
	displayName: 'Sharetribe',
	name: 'sharetribe',
	group: ['output'],
	version: 1,
	subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
	description: 'Allows interaction with the Sharetribe Integration API',
	defaults: {
		name: 'Sharetribe',
	},
	inputs: [NodeConnectionTypes.Main],
	outputs: [NodeConnectionTypes.Main],
	credentials: [
		{
			name: 'sharetribeOAuth2Api',
			required: true,
		},
	],
	properties: [
		{
			displayName: 'Resource',
			name: 'resource',
			type: 'options',
			noDataExpression: true,
			options: [
				// TODO: add support listing availability via marketplace api
				// TODO: add support assets and content
				{
					name: 'Availability Exception',
					value: 'availabilityExceptions',
					description: 'Operations on availability exceptions',
				},
				{
					name: 'Image',
					value: 'image',
					description: 'Operations on images',
				},
				{
					name: 'Listing',
					value: 'listing',
					description: 'Operations on listings',
				},
				{
					name: 'Marketplace',
					value: 'marketplace',
					description: 'Operations on marketplace',
				},
				{
					name: 'Stock',
					value: 'stock',
					description: 'Operations on stock',
				},
				{
					name: 'Transaction',
					value: 'transaction',
					description: 'Operations on transactions',
				},
				{
					name: 'User',
					value: 'user',
					description: 'Operations on users',
				},
			],
			default: 'user',
		},
		...availabilityExceptions.descriptions,
		...user.descriptions,
		...listing.descriptions,
		...transaction.descriptions,
		...marketplace.descriptions,
		...image.descriptions,
		...stock.descriptions,
	],
};
