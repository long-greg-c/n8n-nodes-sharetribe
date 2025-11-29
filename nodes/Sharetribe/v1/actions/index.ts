import type { INodeProperties } from 'n8n-workflow';

import * as user from './user';
import * as listing from './listing';
import * as transaction from './transaction';
import * as marketplace from './marketplace';
import * as image from './image';
import * as availabilityExceptions from './availabilityExceptions';
import * as stock from './stock';

export { user, listing, transaction, marketplace, image, availabilityExceptions, stock };

export const descriptions: INodeProperties[] = [
	{
		displayName: 'Resource',
		name: 'resource',
		type: 'options',
		noDataExpression: true,
		options: [
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
				description: 'Operations on stock management',
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

	...user.descriptions,
	...listing.descriptions,
	...transaction.descriptions,
	...marketplace.descriptions,
	...image.descriptions,
	...availabilityExceptions.descriptions,
	...stock.descriptions,
];
