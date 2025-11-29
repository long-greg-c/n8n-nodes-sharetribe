import { INodeProperties } from 'n8n-workflow';
import { PROPERTY_NAMES } from '../../../GenericFunctions';
import { DOCS_URLS, LoadOptionsMethod, UI_OPERATIONS, UI_RESOURCES } from '../../../constants';

export const sortDescriptionListing: INodeProperties[] = [
	{
		displayName: 'Sort',
		name: 'sort',
		type: 'fixedCollection',
		placeholder: 'Add Sort',
		description:
			'Up to 3 sort options can be added. <a href="' +
			DOCS_URLS.LISTINGS_SORTING +
			'" target="_blank">Learn more</a>',
		typeOptions: {
			multipleValues: true,
			maxAllowedFields: 3, //TODO: why doesn't this actually limit to 3 sort fields?
			sortable: true,
		},
		displayOptions: {
			show: {
				[PROPERTY_NAMES.RESOURCE]: [UI_RESOURCES.LISTING],
				[PROPERTY_NAMES.OPERATION]: [UI_OPERATIONS.GET_MANY],
			},
		},
		default: [],
		options: [
			{
				displayName: 'Sort',
				name: 'sort',
				// eslint-disable-next-line n8n-nodes-base/node-param-fixed-collection-type-unsorted-items
				values: [
					{
						displayName: 'Attribute',
						name: 'field',
						type: 'options',
						options: [
							{
								name: 'Created At',
								value: 'createdAt',
								description: 'Sort by listing creation time',
							},

							{
								name: 'Keywords',
								value: 'keywords',
								description:
									'Sort by relevance score, most relevant listings first (auto-applied with keywords filter)',
							},
							{
								name: 'Location',
								value: 'location',
								description:
									'Sort by distance from location filter (auto-applied with location filter)',
							},
							{
								name: 'Metadata Attribute',
								value: 'metadata',
								description: 'Sort by a top level metadata attribute',
							},
							{
								name: 'Price',
								value: 'price',
								description: 'Sort by listing price',
							},
							{
								name: 'Private Data Attribute',
								value: 'privateData',
								description: 'Sort by a top level private data attribute',
							},
							{
								name: 'Public Data Attribute',
								value: 'publicData',
								description: 'Sort by a top level public data field',
							},
						],
						default: 'createdAt',
						description:
							'The sorting attribute (keywords/location filters auto-apply their respective sorts)',
					},
					{
						displayName: 'Direction',
						name: 'direction',
						type: 'options',
						options: [
							{
								name: 'Ascending',
								value: 'ASC',
							},
							{
								name: 'Descending',
								value: 'DESC',
							},
						],
						default: 'ASC',
						description: 'The sorting direction',
					},
					{
						displayName: 'Attribute Name',
						name: 'metadataAttributeName',
						type: 'resourceLocator',
						default: { mode: 'list', value: '' },
						description: 'Select the metadata attribute to sort by',
						modes: [
							{
								displayName: 'From List',
								name: 'list',
								type: 'list',
								placeholder: 'Select attribute',
								typeOptions: {
									searchListMethod: LoadOptionsMethod.getMetadataAttributes,
									searchable: true,
								},
							},
							{
								displayName: 'By Name',
								name: 'name',
								type: 'string',
								placeholder: 'attributeName',
								hint: 'Enter the top-level metadata attribute name (numbers only)',
							},
						],
						displayOptions: {
							show: { field: ['metadata'] },
						},
					},
					{
						displayName: 'Attribute Name',
						name: 'privateDataAttributeName',
						type: 'resourceLocator',
						default: { mode: 'list', value: '' },
						description: 'Select the private data attribute to sort by',
						modes: [
							{
								displayName: 'From List',
								name: 'list',
								type: 'list',
								placeholder: 'Select attribute',
								typeOptions: {
									searchListMethod: LoadOptionsMethod.getPrivateDataAttributes,
									searchable: true,
								},
							},
							{
								displayName: 'By Name',
								name: 'name',
								type: 'string',
								placeholder: 'attributeName',
								hint: 'Enter the top-level private data attribute name (numbers only)',
							},
						],
						displayOptions: {
							show: { field: ['privateData'] },
						},
					},
					{
						displayName: 'Attribute Name',
						name: 'publicDataAttributeName',
						type: 'resourceLocator',
						default: { mode: 'list', value: '' },
						description: 'Select the public data attribute to sort by',
						modes: [
							{
								displayName: 'From List',
								name: 'list',
								type: 'list',
								placeholder: 'Select attribute',
								typeOptions: {
									searchListMethod: LoadOptionsMethod.getPublicDataAttributes,
									searchable: true,
								},
							},
							{
								displayName: 'By Name',
								name: 'name',
								type: 'string',
								placeholder: 'attributeName',
								hint: 'Enter the top-level public data attribute name (numbers only)',
							},
						],
						displayOptions: {
							show: { field: ['publicData'] },
						},
					},
					{
						displayName:
							'Sort options for Extended Data must be defined with the <a href="https://www.sharetribe.com/docs/how-to/manage-search-schemas-with-sharetribe-cli/">Sharetribe CLI</a> and are only valid for numbers.',
						name: 'notice',
						type: 'notice',
						default: '',
						displayOptions: {
							show: { field: ['publicData', 'privateData', 'metadata'] },
						},
					},
				],
			},
		],
	},
];
