import { INodeProperties } from 'n8n-workflow';
import {
	createFilterConditionTypeField,
	createExtendedDataAttributeField,
	PROPERTY_NAMES,
} from '../../../GenericFunctions';
import { DOCS_URLS, LoadOptionsMethod, UI_OPERATIONS, UI_RESOURCES } from '../../../constants';

export const filterDescriptionListing: INodeProperties[] = [
	{
		displayName: 'Filter',
		name: 'filterOptions',
		type: 'fixedCollection',
		placeholder: 'Add filter',
		displayOptions: {
			show: {
				[PROPERTY_NAMES.RESOURCE]: [UI_RESOURCES.LISTING],
				[PROPERTY_NAMES.OPERATION]: [UI_OPERATIONS.GET_MANY],
			},
		},
		typeOptions: {
			multipleValues: true,
			sortable: true,
		},
		default: {},
		options: [
			{
				displayName: 'Filters',
				name: 'filters',
				// eslint-disable-next-line n8n-nodes-base/node-param-fixed-collection-type-unsorted-items
				values: [
					{
						displayName: 'Filter Type',
						name: 'filterType',
						type: 'options',
						options: [
							{
								name: 'Author',
								value: 'authorId',
								description: 'Filter by specific listing author/user ID',
							},

							{
								name: 'Availability',
								value: 'availability',
								description: 'Filter by availability dates, seats, and duration',
							},
							{
								name: 'Category',
								value: 'category',
								description: 'Filter by listing category',
							},
							{
								name: 'Created Before',
								value: 'createdAtEnd',
								description: 'Filter listings created before a specific date and time',
							},
							{
								name: 'Created On or After',
								value: 'createdAtStart',
								description: 'Filter listings created on or after a specific date and time',
							},
							{
								name: 'Keywords',
								value: 'keywords',
								description: 'Filter by keywords in listing title, description, or public data',
							},
							{
								name: 'List of IDs',
								value: 'ids',
								description: 'Filter by specific listing IDs (up to 100, comma-separated)',
							},

							{
								name: 'Location',
								value: 'location',
								description: 'Filter listings by distance from specific coordinates',
							},
							{
								name: 'Location Bounds',
								value: 'bounds',
								description: 'Filter listings within a geographic bounding box',
							},
							{
								name: 'Metadata',
								value: 'metadata',
								description: 'Filter by <code>metadata</code> attribute values',
							},
							{
								name: 'Price',
								value: 'price',
								description: 'Filter by price range (in currency minor units, e.g. cents)',
							},
							{
								name: 'Public Data',
								value: 'publicData',
								description: 'Filter by <code>publicData</code> attribute values',
							},
							{
								name: 'State',
								value: 'states',
								description: 'Filter by listing states (published, draft, etc.)',
							},
							{
								name: 'Stock',
								value: 'stock',
								description: 'Filter by stock quantity and mode',
							},
							{
								name: 'Type',
								value: 'listingType',
								description: 'Filter by listing type',
							},
						],
						default: 'states',
						description: 'The filter field',
					},
					{
						displayName: 'Author ID',
						name: 'authorId',
						type: 'string',
						default: '',
						description: 'ID of the listing author/user',
						displayOptions: {
							show: { filterType: ['authorId'] },
						},
					},
					{
						displayName: 'Return Listings Created Before',
						name: 'createdAtEndTime',
						type: 'dateTime',
						default: '',
						placeholder: 'Date and time in UTC',
						description: 'Only listings created before the given time are returned',
						displayOptions: {
							show: { filterType: ['createdAtEnd'] },
						},
					},
					{
						displayName: 'Return Listings Created On or After',
						name: 'createdAtStartTime',
						type: 'dateTime',
						default: '',
						placeholder: 'Date and time in UTC',
						description: 'Only listings created on or after the given time are returned',
						displayOptions: {
							show: { filterType: ['createdAtStart'] },
						},
					},
					{
						displayName: 'Price Range Type',
						name: 'priceRangeType',
						type: 'options',
						options: [
							{
								name: 'Exact Price',
								value: 'exact',
							},
							{
								name: 'Price Range',
								value: 'range',
							},
							{
								name: 'Minimum Price',
								value: 'minimum',
							},
							{
								name: 'Maximum Price',
								value: 'maximum',
							},
						],
						default: 'exact',
						description: 'Type of price filtering',
						displayOptions: {
							show: { filterType: ['price'] },
						},
					},
					{
						displayName: 'Price',
						name: 'price',
						type: 'number',
						default: '',
						description: "In the currency's minor unit (e.g. cents for USD)",
						displayOptions: {
							show: { filterType: ['price'], priceRangeType: ['exact'] },
						},
					},
					{
						displayName: 'Minimum Price',
						name: 'priceMin',
						type: 'number',
						default: '',
						description: "Minimum price in the currency's minor unit (e.g. cents for USD)",
						displayOptions: {
							show: { filterType: ['price'], priceRangeType: ['range', 'minimum'] },
						},
					},
					{
						displayName: 'Maximum Price',
						name: 'priceMax',
						type: 'number',
						default: '',
						description: "Maximum price in the currency's minor unit (e.g. cents for USD)",
						displayOptions: {
							show: { filterType: ['price'], priceRangeType: ['range', 'maximum'] },
						},
					},

					createExtendedDataAttributeField('metadata', 'metadata'),
					createExtendedDataAttributeField('publicData', 'publicData'),
					{
						displayName: 'Keywords',
						name: 'keywords',
						type: 'string',
						default: '',
						description: 'Keywords to search in title, description, or public data',
						hint: 'Results will be automatically sorted by relevance (keywords). Adding other sort options will override this default.',
						displayOptions: {
							show: { filterType: ['keywords'] },
						},
					},
					{
						displayName: 'Listing IDs',
						name: 'ids',
						type: 'string',
						default: '',
						description: 'Comma-separated list of listing IDs (max 100)',
						displayOptions: {
							show: { filterType: ['ids'] },
						},
						placeholder: 'ID-1,ID-2',
					},
					{
						displayName: 'Level 1',
						name: 'categoryLevel1',
						type: 'resourceLocator',
						default: { mode: 'list', value: '' },
						description: 'Select the top-level category to filter by',
						modes: [
							{
								displayName: 'From List',
								name: 'list',
								type: 'list',
								placeholder: 'Select category',
								typeOptions: {
									searchListMethod: LoadOptionsMethod.getCategoryLevel1,
									searchable: true,
								},
							},
							{
								displayName: 'By Name',
								name: 'name',
								type: 'string',
								placeholder: 'categoryName',
								hint: 'Enter the category name',
							},
						],

						displayOptions: {
							show: { filterType: ['category'] },
						},
					},
					{
						displayName: 'Level 2',
						name: 'categoryLevel2',
						type: 'resourceLocator',
						default: { mode: 'list', value: '' },
						description: 'Select the second-level category to filter by',
						typeOptions: {
							loadOptionsDependsOn: ['categoryLevel1.value'],
						},
						modes: [
							{
								displayName: 'From List',
								name: 'list',
								type: 'list',
								placeholder: 'Select category',
								typeOptions: {
									searchListMethod: LoadOptionsMethod.getCategoryLevel2,
									searchable: true,
								},
							},
							{
								displayName: 'By Name',
								name: 'name',
								type: 'string',
								placeholder: 'subcategoryName',
								hint: 'Enter the subcategory name',
							},
						],
						displayOptions: {
							show: { filterType: ['category'] },
						},
					},
					{
						displayName: 'Level 3',
						name: 'categoryLevel3',
						type: 'resourceLocator',
						default: { mode: 'list', value: '' },
						description: 'Select the third-level category to filter by',
						typeOptions: {
							loadOptionsDependsOn: ['categoryLevel1.value', 'categoryLevel2.value'],
						},
						modes: [
							{
								displayName: 'From List',
								name: 'list',
								type: 'list',
								placeholder: 'Select category',
								typeOptions: {
									searchListMethod: LoadOptionsMethod.getCategoryLevel3,
									searchable: true,
								},
							},
							{
								displayName: 'By Name',
								name: 'name',
								type: 'string',
								placeholder: 'subSubcategoryName',
								hint: 'Enter the sub-subcategory name',
							},
						],
						displayOptions: {
							show: {
								filterType: ['category'],
							},
						},
					},
					{
						displayName: 'Listing Type',
						name: 'listingType',
						type: 'resourceLocator',
						default: { mode: 'list', value: '' },
						description: 'Select the listing type to filter by',
						modes: [
							{
								displayName: 'From List',
								name: 'list',
								type: 'list',
								placeholder: 'Select listing type',
								typeOptions: {
									searchListMethod: LoadOptionsMethod.getListingTypes,
									searchable: true,
								},
							},
							{
								displayName: 'By Name',
								name: 'name',
								type: 'string',
								placeholder: 'listingTypeName',
								hint: 'Enter the listing type name',
							},
						],
						displayOptions: {
							show: { filterType: ['listingType'] },
						},
					},
					{
						//TODO: MAke the ux for this nicer, show different notice element
						// based on selected availability type. min duration could be days or minutes
						displayName: 'Availability Options',
						name: 'availabilityOptions',
						type: 'fixedCollection',
						description:
							'Availability filtering is best understood by reading the docs. <a href="' +
							DOCS_URLS.AVAILABILITY_FILTERING +
							'" target="_blank">Learn more</a>',
						placeholder: 'Add availability filter',
						displayOptions: {
							show: { filterType: ['availability'] },
						},
						typeOptions: {
							multipleValues: false,
						},
						default: {},
						options: [
							{
								displayName: 'Availability Settings',
								name: 'settings',
								// eslint-disable-next-line n8n-nodes-base/node-param-fixed-collection-type-unsorted-items
								values: [
									{
										displayName: 'Availability Type',
										name: 'availabilityType',
										type: 'options',
										options: [
											{
												name: 'Day Full',
												value: 'day-full',
												description: 'Day-based plans, full availability (supports pagination)',
											},
											{
												name: 'Day Partial',
												value: 'day-partial',
												description:
													'Day-based plans, partial availability (NO pagination - max 100 results)',
											},
											{
												name: 'Time Full',
												value: 'time-full',
												description:
													'Time-based plans, full availability (NO pagination - max 100 results)',
											},
											{
												name: 'Time Partial',
												value: 'time-partial',
												description:
													'Time-based plans, partial availability (NO pagination - max 100 results)',
											},
										],
										default: 'day-full',
										description: 'Type of availability search - affects pagination support',
									},
									{
										displayName: 'Start Time',
										name: 'start',
										type: 'dateTime',
										default: '',
										placeholder: 'Date and time in UTC',
										description:
											'Start time for availability filtering. <a href="' +
											DOCS_URLS.LISTINGS_QUERY +
											'" target="_blank">Learn more</a>',
										hint: 'Between 1 day past and 365 days future',
									},
									{
										displayName: 'End Time',
										name: 'end',
										type: 'dateTime',
										default: '',
										placeholder: 'Date and time in UTC',
										description:
											'End time for availability filtering. <a href="' +
											DOCS_URLS.LISTINGS_QUERY +
											'" target="_blank">Learn more</a>',
										hint: 'After start. Max 365 days future or max 90 days from start (whichever comes sooner)',
									},
									{
										displayName: 'Minimum Seats',
										name: 'seats',
										type: 'number',
										default: 1,
										description: 'Minimum available seats for a listing',
									},
									{
										displayName: 'Minimum Duration',
										name: 'minDuration',
										type: 'number',
										default: 0,
										description:
											'Minimum duration: days for day-partial, minutes for time-partial (default: 0)',
									},
								],
							},
						],
					},
					{
						displayName:
							'⚠️ IMPORTANT: Time-based availability queries (time-full, time-partial) and day-partial queries with minDuration do NOT support pagination. Results are limited to 100 listings maximum. Use "Limit Matches" result mode and adjust your search criteria for best results. <a href="' +
							DOCS_URLS.AVAILABILITY_FILTERING +
							'" target="_blank">Learn more</a>',
						name: 'availabilityNotice',
						type: 'notice',
						default: '',
						displayOptions: {
							show: { filterType: ['availability'] },
						},
					},
					{
						displayName: 'Stock Options',
						name: 'stockOptions',
						type: 'fixedCollection',
						placeholder: 'Add stock filter',
						displayOptions: {
							show: { filterType: ['stock'] },
						},
						typeOptions: {
							multipleValues: false,
						},
						default: {},
						options: [
							{
								displayName: 'Stock Settings',
								name: 'settings',
								values: [
									{
										displayName: 'Stock Mode',
										name: 'stockMode',
										type: 'options',
										options: [
											{
												name: 'Strict',
												value: 'strict',
												description: 'Strict stock matching (default)',
											},
											{
												name: 'Match Undefined',
												value: 'match-undefined',
												description: 'Match listings with undefined stock',
											},
										],
										default: 'strict',
										description: 'Type of stock query',
									},
									{
										displayName: 'Minimum Stock Quantity',
										name: 'minStock',
										type: 'number',
										default: 1,
										description: 'Minimum stock quantity to match',
									},
								],
							},
						],
					},
					{
						displayName: 'Location',
						name: 'origin',
						type: 'string',
						default: '',
						placeholder: 'lat,lng (e.g., 37.7749,-122.4194)',
						description: 'Coordinates for distance-based search (latitude,longitude)',
						hint: 'Results will be automatically sorted by distance (location). Adding other sort options will override this default.',
						displayOptions: {
							show: { filterType: ['location'] },
						},
					},
					{
						displayName: 'Northeast Corner',
						name: 'boundsNE',
						type: 'string',
						default: '',
						placeholder: 'lat,lng (e.g., 37.8049,-122.3994)',
						description: 'Northeast corner coordinates of bounding box (latitude,longitude)',
						displayOptions: {
							show: { filterType: ['bounds'] },
						},
					},
					{
						displayName: 'Southwest Corner',
						name: 'boundsSW',
						type: 'string',
						default: '',
						placeholder: 'lat,lng (e.g., 37.7449,-122.4394)',
						description: 'Southwest corner coordinates of bounding box (latitude,longitude)',
						displayOptions: {
							show: { filterType: ['bounds'] },
						},
					},
					{
						displayName: 'Listing States',
						name: 'states',
						type: 'multiOptions',
						options: [
							{
								name: 'Closed',
								value: 'closed',
								description: 'Listing closed by author or marketplace operator',
							},
							{
								name: 'Draft',
								value: 'draft',
								description: 'Listing is in draft state and has not been published yet',
							},
							{
								name: 'Pending Approval',
								value: 'pendingApproval',
								description: 'Listing is pending operator approval',
							},
							{
								name: 'Published',
								value: 'published',
								description: 'Listing is published and discoverable',
							},
						],
						default: [],
						description: 'Listing states to filter by',
						displayOptions: {
							show: { filterType: ['states'] },
						},
					},
					{
						displayOptions: {
							show: {
								filterType: ['publicData', 'privateData', 'metadata'],
							},
						},
						...createFilterConditionTypeField(true),
					},
					{
						displayName: 'Value',
						name: 'extendedDataValue',
						type: 'string',
						default: '',
						description: 'Value to filter by',
						displayOptions: {
							show: {
								filterType: ['publicData', 'privateData', 'metadata'],
								condition_type: ['eq', 'gteq', 'lt', 'hasAll', 'hasAny'],
							},
						},
					},
					{
						displayName: 'Minimum Value',
						name: 'extendedDataMinValue',
						type: 'string',
						default: '',
						description: 'Minimum value for range filtering',
						displayOptions: {
							show: {
								filterType: ['publicData', 'privateData', 'metadata'],
								condition_type: ['range'],
							},
						},
					},
					{
						displayName: 'Maximum Value',
						name: 'extendedDataMaxValue',
						type: 'string',
						default: '',
						description: 'Maximum value for range filtering',
						displayOptions: {
							show: {
								filterType: ['publicData', 'privateData', 'metadata'],
								condition_type: ['range'],
							},
						},
					},
					{
						displayName: `Filtering by <code>metadata</code> must be enabled by defining a search schema with the <a target="_blank" href="https://www.sharetribe.com/docs/references/extended-data/#search-schema">Sharetribe CLI</a>. <br><br>Valid for top-level numbers, enums and booleans.<br><br>Use 'Keyword' filter to search listing title, description and any extended data attributes with type <code>text</code> that have a search schema defined.`,
						name: 'notice',
						type: 'notice',
						default: '',
						displayOptions: {
							show: { filterType: ['metadata'] },
						},
					},
					{
						displayName: `Filtering by <code>publicData</code> must be enabled by defining a search schema with the <a target="_blank" href="https://www.sharetribe.com/docs/references/extended-data/#search-schema">Sharetribe CLI</a>. <br><br>Valid for top-level numbers, enums and booleans.<br><br>Use 'Keyword' filter to search listing title, description and any extended data attributes with type <code>text</code> that have a search schema defined.`,
						name: 'notice',
						type: 'notice',
						default: '',
						displayOptions: {
							show: { filterType: ['publicData'] },
						},
					},
				],
			},
		],
	},
];
