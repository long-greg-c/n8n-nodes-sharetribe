import { Icon, ICredentialTestRequest, ICredentialType, INodeProperties } from 'n8n-workflow';

export class SharetribeOAuth2Api implements ICredentialType {
	name = 'sharetribeOAuth2Api';
	extends = ['oAuth2Api'];
	// eslint-disable-next-line n8n-nodes-base/cred-class-field-display-name-missing-oauth2
	displayName = 'Sharetribe Integration API';
	description = 'Sharetribe Integration API';
	documentationUrl =
		'https://www.sharetribe.com/docs/introduction/getting-started-with-integration-api/';
	icon: Icon = { light: 'file:../icons/sharetribe.svg', dark: 'file:../icons/sharetribe.dark.svg' };
	properties: INodeProperties[] = [
		{
			displayName: 'Grant Type',
			name: 'grantType',
			type: 'hidden',
			default: 'clientCredentials',
		},
		{
			displayName: 'Integration API Client ID',
			name: 'clientId',
			type: 'string',
			default: '',
			required: true,
			description: 'Your Sharetribe Integration API Client ID',
			hint: 'Get your Client ID from <a href="https://console.sharetribe.com/advanced/applications" target="_blank">Sharetribe Console → Build → Advanced → Applications</a>',
		},
		{
			displayName: 'Integration API Client Secret',
			name: 'clientSecret',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Your Sharetribe Integration API Client Secret',
			hint: 'Get your Client Secret from <a href="https://console.sharetribe.com/advanced/applications" target="_blank">Sharetribe Console → Build → Advanced → Applications</a>',
		},
		{
			displayName: 'Marketplace API Client ID',
			name: 'marketplaceApiClientId',
			type: 'string',
			default: '',
			description: 'Your Sharetribe MArketplace API Client ID',
			hint: 'Get your Client ID from <a href="https://console.sharetribe.com/advanced/applications" target="_blank">Sharetribe Console → Build → Advanced → Applications</a>',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'hidden',
			default: 'https://flex-api.sharetribe.com',
		},
		{
			displayName: 'Access Token URL',
			name: 'accessTokenUrl',
			type: 'hidden',
			default: 'https://flex-api.sharetribe.com/v1/auth/token',
			required: true,
		},
		{
			displayName: 'Scope',
			name: 'scope',
			type: 'hidden',
			default: 'integ',
			required: true,
		},
		{
			displayName: 'Authentication',
			name: 'authentication',
			type: 'hidden',
			default: 'body',
		},
		{
			displayName: 'Asset Delivery API Base URL',
			name: 'assetApiBaseUrl',
			type: 'hidden',
			default: 'https://cdn.st-api.com/v1/assets/pub',
			required: true,
		},
		{
			displayName: 'Auto Populate Search Filters',
			name: 'enableDynamicLearning',
			type: 'boolean',
			default: false,
			hint: 'Populates search filters from real recent transactions, listings and users.',
			description:
				'Auto-populate search filters and sort options by learning from recent transactions, listings and users.',
		},
		{
			displayName:
				"When 'Populate Search Filters' is enabled real data from your recent transactions, listings, and users is used to discover available processes, states, transitions, listing types and extended data fields available for filtering and sorting.",
			name: 'notice1',
			type: 'notice',
			default: '',
			displayOptions: {
				show: {
					enableDynamicLearning: [true],
				},
			},
		},
		{
			displayName: 'Auto Populate Settings',
			name: 'discoverySettings',
			type: 'fixedCollection',
			placeholder: 'Add setting',
			description: 'ttl and count',
			default: '',
			displayOptions: {
				show: {
					enableDynamicLearning: [true],
				},
			},
			options: [
				{
					displayName: 'Settings',
					name: 'settings',
					values: [
						{
							displayName: 'Resource Limit',
							name: 'discoveryResourceLimit',
							type: 'number',
							default: 10,
							description:
								'Number of resources (transactions, listings, users) to fetch for discovery',
							hint: 'Higher values provide better discovery but increase API calls',
							typeOptions: {
								minValue: 1,
								maxValue: 100,
							},
						},
						{
							displayName: 'Cache TTL (minutes)',
							name: 'discoveryCacheTTL',
							type: 'number',
							default: 5,
							description: 'How long (in minutes) to cache discovered data before refreshing',
							hint: 'Lower values keep data fresher but increase API calls',
							typeOptions: {
								minValue: 1,
								maxValue: 60,
							},
						},
					],
				},
			],
		},
		{
			displayName: 'Enable Rate Limiting',
			name: 'enableRateLimit',
			type: 'boolean',
			default: false,
			hint: 'Only needed for dev/test environments',
			description:
				'Enable rate limiting for dev/test environments (Query: 1 req/sec, Commands: 1 req/2sec). Listing creation is always rate limited (100 req/min).',
		},
		{
			displayName: 'Send Additional Body Properties',
			name: 'sendAdditionalBodyProperties',
			type: 'hidden',
			default: false,
		},
		{
			displayName: 'Allowed HTTP Request Domains',
			name: 'allowedHttpRequestDomains',
			type: 'hidden',
			default: '',
		},
	];

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://flex-api.sharetribe.com',
			url: '/v1/integration_api/marketplace/show',
			headers: { Accept: 'application/json' },
			method: 'GET',
		},
	};
}
