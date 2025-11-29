/**
 * Load Options - Auto-populate resource locator dropdown options for:
 * Transactions, Listings, Users.
 *
 * Data is auto populated by querying and learning from x number of recent
 * transactions included with with listing, provider, customer.
 *
 * Data learned includes:
 *
 * Transaction: states, transition names, process names, searchable protected and metadata attributes.
 * Listing: Listing types, searchable public and metadata attributes.
 * User: Searchable public, private, protected and metadata attributes.
 *
 * User's have the option to set the cache TTL and number of resources to fetch and learn from.
 * Defaults 5 mins and 10 resources.
 *
 * Data is cached using a hash key made up of the marketplace api client id, integration api client id,
 * TTL and resource count..
 *
 */

import type {
	IDataObject,
	ILoadOptionsFunctions,
	INodePropertyOptions,
	INodeListSearchResult,
} from 'n8n-workflow';
import {
	getDiscoveredData,
	readCreds,
	toOptions,
	extToOptions,
	fetchAssetJson,
	toOpt,
	FALLBACK_PROCESSES,
	FALLBACK_STATES,
	FALLBACK_TRANSITIONS,
} from './shared';

/* ----------------------- SEARCH LIST METHODS ------------------------------- */

export async function getProcessNames(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	this.logger.info('[Sharetribe] listSearch.getProcessNames called', { filter });
	const force = !!this.getCurrentNodeParameter?.('refreshDiscoveredData');
	const discovered = await getDiscoveredData.call(this, { forceRefresh: force });
	const src = discovered.processes.size ? discovered.processes : new Set(FALLBACK_PROCESSES);
	const out = toOptions(src);
	const results = out.length ? out : FALLBACK_PROCESSES.map((p) => ({ name: p, value: p }));

	const filtered = filter
		? results.filter(
				(item: INodePropertyOptions) =>
					item.name.toLowerCase().includes(filter.toLowerCase()) ||
					String(item.value).toLowerCase().includes(filter.toLowerCase()),
			)
		: results;

	return { results: filtered };
}

export async function getTransactionStates(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	this.logger.info('[Sharetribe] listSearch.getTransactionStates called', { filter });
	const force = !!this.getCurrentNodeParameter?.('refreshDiscoveredData');
	const discovered = await getDiscoveredData.call(this, { forceRefresh: force });
	const src = discovered.states.size ? discovered.states : new Set(FALLBACK_STATES);
	const normalized = Array.from(src).map((s) => (s.startsWith('state/') ? s : `state/${s}`));
	const out = toOptions(new Set(normalized));

	const filtered = filter
		? out.filter(
				(item: INodePropertyOptions) =>
					item.name.toLowerCase().includes(filter.toLowerCase()) ||
					String(item.value).toLowerCase().includes(filter.toLowerCase()),
			)
		: out;

	return { results: filtered };
}

export async function getTransitions(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	this.logger.info('[Sharetribe] listSearch.getTransitions called', { filter });
	const force = !!this.getCurrentNodeParameter?.('refreshDiscoveredData');
	const discovered = await getDiscoveredData.call(this, { forceRefresh: force });
	const src = discovered.transitions.size ? discovered.transitions : new Set(FALLBACK_TRANSITIONS);
	const normalized = Array.from(src).map((t) =>
		t.startsWith('transition/') ? t : `transition/${t}`,
	);
	const out = toOptions(new Set(normalized));

	const filtered = filter
		? out.filter(
				(item: INodePropertyOptions) =>
					item.name.toLowerCase().includes(filter.toLowerCase()) ||
					String(item.value).toLowerCase().includes(filter.toLowerCase()),
			)
		: out;

	return { results: filtered };
}

export async function getMetadataAttributes(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	this.logger.info('[Sharetribe] listSearch.getMetadataAttributes called', { filter });
	const force = !!this.getCurrentNodeParameter?.('refreshDiscoveredData');
	const discovered = await getDiscoveredData.call(this, { forceRefresh: force });
	const { enableAutoPopulate } = await readCreds.call(this);
	const merged: Record<string, string> = {};

	if (enableAutoPopulate) {
		// Get validated fields for each resource type
		const { getValidatedFields } = await import('./shared');
		const [transactionFields, listingFields, userFields] = await Promise.all([
			getValidatedFields.call(this, 'transaction', 'metadata'),
			getValidatedFields.call(this, 'listing', 'metadata'),
			getValidatedFields.call(this, 'user', 'metadata'),
		]);

		// Merge validated fields
		// Note: Validation already excludes complex types (arrays, objects)
		// String types represent enum values in Sharetribe and CAN be filtered/sorted
		for (const field of transactionFields) {
			merged[field] = discovered.extended.transaction[field];
		}
		for (const field of listingFields) {
			merged[field] = discovered.extended.listing[field];
		}
		for (const field of userFields) {
			merged[field] = discovered.extended.customer[field] || discovered.extended.provider[field];
		}
	} else {
		// No validation, just collect all fields (excluding complex types)
		const sources = [
			discovered.extended.transaction,
			discovered.extended.listing,
			discovered.extended.customer,
			discovered.extended.provider,
		];
		for (const data of sources) {
			for (const [k, v] of Object.entries(data)) {
				if (k.startsWith('metadata.') && !['array', 'object'].includes(v)) {
					merged[k] = v;
				}
			}
		}
	}
	const results = extToOptions(merged);

	const filtered = filter
		? results.filter(
				(item: INodePropertyOptions) =>
					item.name.toLowerCase().includes(filter.toLowerCase()) ||
					String(item.value).toLowerCase().includes(filter.toLowerCase()),
			)
		: results;
	return { results: filtered };
}

export async function getPublicDataAttributes(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	this.logger.info('[Sharetribe] listSearch.getPublicDataAttributes called', { filter });
	const force = !!this.getCurrentNodeParameter?.('refreshDiscoveredData');
	const discovered = await getDiscoveredData.call(this, { forceRefresh: force });
	const { enableAutoPopulate } = await readCreds.call(this);
	const merged: Record<string, string> = {};

	// Import predefined fields constant
	const { PREDEFINED_PUBLIC_DATA_FIELDS } = await import('../constants');
	const predefinedFields = new Set(PREDEFINED_PUBLIC_DATA_FIELDS);

	if (enableAutoPopulate) {
		// Get validated fields for each resource type
		const { getValidatedFields } = await import('./shared');
		const [listingFields, userFields] = await Promise.all([
			getValidatedFields.call(this, 'listing', 'publicData'),
			getValidatedFields.call(this, 'user', 'publicData'),
		]);

		// Merge validated fields, excluding predefined fields
		// Note: Validation already excludes complex types (arrays, objects)
		// String types represent enum values in Sharetribe and CAN be filtered/sorted
		for (const field of listingFields) {
			if (!predefinedFields.has(field)) {
				merged[field] = discovered.extended.listing[field];
			}
		}
		for (const field of userFields) {
			if (!predefinedFields.has(field)) {
				merged[field] = discovered.extended.customer[field] || discovered.extended.provider[field];
			}
		}
	} else {
		// No validation, just collect all fields (excluding predefined and complex types)
		const sources = [
			discovered.extended.listing,
			discovered.extended.customer,
			discovered.extended.provider,
		];
		for (const data of sources) {
			for (const [k, v] of Object.entries(data)) {
				if (
					k.startsWith('publicData.') &&
					!predefinedFields.has(k) &&
					!['array', 'object'].includes(v)
				) {
					merged[k] = v;
				}
			}
		}
	}
	const results = extToOptions(merged);
	const filtered = filter
		? results.filter(
				(item: INodePropertyOptions) =>
					item.name.toLowerCase().includes(filter.toLowerCase()) ||
					String(item.value).toLowerCase().includes(filter.toLowerCase()),
			)
		: results;
	return { results: filtered };
}

export async function getPrivateDataAttributes(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	this.logger.info('[Sharetribe] listSearch.getPrivateDataAttributes called', { filter });
	const force = !!this.getCurrentNodeParameter?.('refreshDiscoveredData');
	const discovered = await getDiscoveredData.call(this, { forceRefresh: force });
	const { enableAutoPopulate } = await readCreds.call(this);
	const merged: Record<string, string> = {};

	if (enableAutoPopulate) {
		// Get validated fields for each resource type
		const { getValidatedFields } = await import('./shared');
		const [listingFields, userFields] = await Promise.all([
			getValidatedFields.call(this, 'listing', 'privateData'),
			getValidatedFields.call(this, 'user', 'privateData'),
		]);

		// Merge validated fields
		for (const field of listingFields) {
			merged[field] = discovered.extended.listing[field];
		}
		for (const field of userFields) {
			merged[field] = discovered.extended.customer[field] || discovered.extended.provider[field];
		}
	} else {
		// No validation, just collect all fields
		const sources = [
			discovered.extended.listing,
			discovered.extended.customer,
			discovered.extended.provider,
		];
		for (const data of sources) {
			for (const [k, v] of Object.entries(data)) {
				if (k.startsWith('privateData.')) {
					merged[k] = v;
				}
			}
		}
	}
	const results = extToOptions(merged);
	const filtered = filter
		? results.filter(
				(item: INodePropertyOptions) =>
					item.name.toLowerCase().includes(filter.toLowerCase()) ||
					String(item.value).toLowerCase().includes(filter.toLowerCase()),
			)
		: results;
	return { results: filtered };
}

export async function getProtectedDataAttributes(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	this.logger.info('[Sharetribe] listSearch.getProtectedDataAttributes called', { filter });
	const force = !!this.getCurrentNodeParameter?.('refreshDiscoveredData');
	const discovered = await getDiscoveredData.call(this, { forceRefresh: force });
	const { enableAutoPopulate } = await readCreds.call(this);
	const merged: Record<string, string> = {};

	if (enableAutoPopulate) {
		// Get validated fields for each resource type
		const { getValidatedFields } = await import('./shared');
		const [transactionFields, userFields] = await Promise.all([
			getValidatedFields.call(this, 'transaction', 'protectedData'),
			getValidatedFields.call(this, 'user', 'protectedData'),
		]);

		// Merge validated fields
		for (const field of transactionFields) {
			merged[field] = discovered.extended.transaction[field];
		}
		for (const field of userFields) {
			merged[field] = discovered.extended.customer[field] || discovered.extended.provider[field];
		}
	} else {
		// No validation, just collect all fields
		const sources = [
			discovered.extended.transaction,
			discovered.extended.customer,
			discovered.extended.provider,
		];
		for (const data of sources) {
			for (const [k, v] of Object.entries(data)) {
				if (k.startsWith('protectedData.')) {
					merged[k] = v;
				}
			}
		}
	}
	const results = extToOptions(merged);
	const filtered = filter
		? results.filter(
				(item: INodePropertyOptions) =>
					item.name.toLowerCase().includes(filter.toLowerCase()) ||
					String(item.value).toLowerCase().includes(filter.toLowerCase()),
			)
		: results;
	return { results: filtered };
}

export async function getListingTypes(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	this.logger.info('[Sharetribe] listSearch.getListingTypes called', { filter });
	const response = await fetchAssetJson.call(this, 'listings/listing-types.json');
	const listingTypes = (response?.data as Record<string, unknown>)?.listingTypes;

	let results: INodePropertyOptions[] = [];

	if (Array.isArray(listingTypes)) {
		// Array format: ["type1", "type2"]
		results = listingTypes.map((type) => toOpt(type, String(type)));
	} else if (listingTypes && typeof listingTypes === 'object') {
		// Object format: { "key": "value" }
		results = Object.entries(listingTypes).map(([key, val]) => toOpt(val, key));
	}

	results.sort((a, b) => a.name.localeCompare(b.name));

	return { results: applyFilterToResults(results, filter) };
}

interface Category {
	id: string;
	name: string;
	subcategories?: Category[];
}

interface CategoryData {
	data: {
		categories: Category[];
	};
}

function findCategoryById(categories: Category[], id: string): Category | null {
	for (const cat of categories) {
		if (cat.id === id) return cat;
	}
	return null;
}

function applyFilterToResults(
	results: INodePropertyOptions[],
	filter?: string,
): INodePropertyOptions[] {
	if (!filter) return results;
	const lowerFilter = filter.toLowerCase();
	return results.filter(
		(item) =>
			item.name.toLowerCase().includes(lowerFilter) ||
			String(item.value).toLowerCase().includes(lowerFilter),
	);
}

function getCategoryIdFromFilterOptions(
	filterOptions: IDataObject,
	level: 'categoryLevel1' | 'categoryLevel2',
): string | null {
	if (
		Array.isArray(filterOptions.filters) &&
		filterOptions.filters.length &&
		filterOptions.filters[0]?.filterType === 'category'
	) {
		return (filterOptions.filters[0]?.[level]?.value as string) || null;
	}
	return null;
}

function categoriesToOptions(categories: Category[]): INodePropertyOptions[] {
	return categories
		.map((cat) => ({
			name: cat.name,
			value: cat.id,
		}))
		.sort((a, b) => a.name.localeCompare(b.name));
}

async function getCategoriesAtLevel(
	context: ILoadOptionsFunctions,
	parentIds: string[],
): Promise<Category[]> {
	const content = (await fetchAssetJson.call(
		context,
		'listings/listing-categories.json',
	)) as CategoryData | null;
	let categories = content?.data?.categories || [];

	for (const parentId of parentIds) {
		const parent = findCategoryById(categories, parentId);
		if (!parent?.subcategories) return [];
		categories = parent.subcategories;
	}

	return categories;
}

export async function getCategoryLevel1(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	this.logger.info('[Sharetribe] listSearch.getCategoryLevel1 called', { filter });
	const categories = await getCategoriesAtLevel(this, []);
	const results = categoriesToOptions(categories);
	return { results: applyFilterToResults(results, filter) };
}

export async function getCategoryLevel2(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	this.logger.info('[Sharetribe] listSearch.getCategoryLevel2 called', { filter });
	const filterOptions = this.getNodeParameter('filterOptions', undefined, {
		extractValue: true,
	}) as IDataObject;

	const level1Id = getCategoryIdFromFilterOptions(filterOptions, 'categoryLevel1');

	let categories: Category[];
	if (level1Id) {
		// Filter by parent category
		categories = await getCategoriesAtLevel(this, [level1Id]);
	} else {
		// No parent selected - show all level 2 categories from all level 1 parents
		const content = (await fetchAssetJson.call(
			this,
			'listings/listing-categories.json',
		)) as CategoryData | null;
		const allLevel1 = content?.data?.categories || [];
		categories = allLevel1.flatMap((cat) => cat.subcategories || []);
	}

	const results = categoriesToOptions(categories);
	return { results: applyFilterToResults(results, filter) };
}

export async function getCategoryLevel3(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	this.logger.info('[Sharetribe] listSearch.getCategoryLevel3 called', { filter });
	const filterOptions = this.getNodeParameter('filterOptions', undefined, {
		extractValue: true,
	}) as IDataObject;

	const level1Id = getCategoryIdFromFilterOptions(filterOptions, 'categoryLevel1');
	const level2Id = getCategoryIdFromFilterOptions(filterOptions, 'categoryLevel2');

	let categories: Category[];
	if (level1Id && level2Id) {
		// Both parents selected - show filtered subcategories
		categories = await getCategoriesAtLevel(this, [level1Id, level2Id]);
	} else if (level1Id) {
		// Only level 1 selected - show all level 3 from that level 1's subcategories
		const level2Categories = await getCategoriesAtLevel(this, [level1Id]);
		categories = level2Categories.flatMap((cat) => cat.subcategories || []);
	} else {
		// No parents selected - show all level 3 categories from everywhere
		const content = (await fetchAssetJson.call(
			this,
			'listings/listing-categories.json',
		)) as CategoryData | null;
		const allLevel1 = content?.data?.categories || [];
		categories = allLevel1.flatMap((l1) =>
			(l1.subcategories || []).flatMap((l2) => l2.subcategories || []),
		);
	}

	const results = categoriesToOptions(categories);
	return { results: applyFilterToResults(results, filter) };
}

export async function getCurrencyCodes(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	this.logger.info('[Sharetribe] listSearch.getCurrencyCodes called', { filter });

	// Import CurrencyCode enum from constants
	const { CurrencyCode } = await import('../constants');

	const results: INodePropertyOptions[] = Object.values(CurrencyCode).map((code) => ({
		name: code,
		value: code,
	}));

	return { results: applyFilterToResults(results, filter) };
}
