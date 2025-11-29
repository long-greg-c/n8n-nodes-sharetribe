/**
 * Cache Management for Auto-Populate Data Discovery
 *
 * Implements a two-tier caching strategy:
 * 1. In-memory cache (Map) - Fast, ephemeral, cleared on restart
 * 2. Workflow static data cache - Persistent across workflow executions
 *
 * Cache TTL is configurable via credentials (default: 5 minutes)
 */

import type { ILoadOptionsFunctions, IDataObject } from 'n8n-workflow';
import type { DiscoveredData } from './shared';
import { createHash } from 'crypto';

type CacheEntry = { value: DiscoveredData; expiresAt: number };

/**
 * Structure for serialized cache entry in static data
 */
interface StaticCacheEntry {
	expiresAt: number;
	value: {
		processes: string[];
		states: string[];
		transitions: string[];
		bookingStates: string[];
		extended: DiscoveredData['extended'];
		validated?: {
			transaction: string[];
			listing: string[];
			user: string[];
		};
		lastTransactionTimestamp?: string;
		lastListingTimestamp?: string;
		lastUserTimestamp?: string;
	};
}

/**
 * Structure for workflow static data
 */
interface WorkflowStaticData extends IDataObject {
	sharetribeDiscovered?: {
		[key: string]: StaticCacheEntry;
	};
	__dataChanged?: boolean;
}

// In-memory cache (cleared on n8n restart)
const _memCache = new Map<string, CacheEntry>();

// In-flight requests tracker (prevents duplicate API calls)
const _inflight = new Map<string, Promise<DiscoveredData>>();

/**
 * Generate unique cache key from marketplace configuration
 */
export function makeCacheKey(
	baseUrl: string,
	integrationClientId: string,
	marketplaceClientId: string,
	enableAutoPopulate: boolean,
	discoveryResourceLimit: number,
	discoveryCacheTTLMinutes: number,
	credentialId?: string,
): string {
	const credPart = credentialId ? `::CRED=${credentialId}` : '';
	const toHash = `${baseUrl}::${marketplaceClientId}::${integrationClientId}::AP=${enableAutoPopulate ? 1 : 0}::LIMIT=${discoveryResourceLimit}::TTL=${discoveryCacheTTLMinutes}${credPart}`;
	const hash = createHash('sha256');
	hash.update(toHash);

	return hash.digest('hex');
}

/**
 * Convert DiscoveredData (with Sets) to plain object for storage
 */
function discoveredToStatic(entry: CacheEntry) {
	return {
		expiresAt: entry.expiresAt,
		value: {
			processes: Array.from(entry.value.processes),
			states: Array.from(entry.value.states),
			transitions: Array.from(entry.value.transitions),
			bookingStates: Array.from(entry.value.bookingStates),
			extended: entry.value.extended,
			validated: entry.value.validated
				? {
						transaction: Array.from(entry.value.validated.transaction),
						listing: Array.from(entry.value.validated.listing),
						user: Array.from(entry.value.validated.user),
					}
				: undefined,
			lastTransactionTimestamp: entry.value.lastTransactionTimestamp,
			lastListingTimestamp: entry.value.lastListingTimestamp,
			lastUserTimestamp: entry.value.lastUserTimestamp,
		},
	};
}

/**
 * Convert plain object back to DiscoveredData (with Sets)
 */
function staticToDiscovered(s: StaticCacheEntry): CacheEntry {
	return {
		expiresAt: s.expiresAt,
		value: {
			processes: new Set(s.value.processes),
			states: new Set(s.value.states),
			transitions: new Set(s.value.transitions),
			bookingStates: new Set(s.value.bookingStates || []),
			extended: s.value.extended,
			validated: s.value.validated
				? {
						transaction: new Set(s.value.validated.transaction),
						listing: new Set(s.value.validated.listing),
						user: new Set(s.value.validated.user),
					}
				: undefined,
			lastTransactionTimestamp: s.value.lastTransactionTimestamp,
			lastListingTimestamp: s.value.lastListingTimestamp,
			lastUserTimestamp: s.value.lastUserTimestamp,
		},
	};
}

/**
 * Read from workflow static data cache
 */
export function readStaticCache(ctx: ILoadOptionsFunctions, key: string): CacheEntry | null {
	try {
		const sd = ctx.getWorkflowStaticData('node') as WorkflowStaticData;
		const bag = sd.sharetribeDiscovered || {};
		const raw = bag[key];
		if (!raw?.expiresAt || !raw.value) return null;
		ctx.logger.info('[Sharetribe] Cache hit from static data');
		return staticToDiscovered(raw);
	} catch {
		return null;
	}
}

/**
 * Write to workflow static data cache
 */
export function writeStaticCache(ctx: ILoadOptionsFunctions, key: string, entry: CacheEntry): void {
	try {
		const sd = ctx.getWorkflowStaticData('node') as WorkflowStaticData;
		const bag = sd.sharetribeDiscovered || {};
		bag[key] = discoveredToStatic(entry);
		sd.sharetribeDiscovered = bag;
		sd.__dataChanged = true;
		ctx.logger.info('[Sharetribe] Data cached to static storage');
	} catch {
		// Silent fail - caching is optional
	}
}

/**
 * Get from in-memory cache
 */
export function getMemCache(key: string): CacheEntry | undefined {
	return _memCache.get(key);
}

/**
 * Set in-memory cache
 */
export function setMemCache(key: string, entry: CacheEntry): void {
	_memCache.set(key, entry);
}

/**
 * Get in-flight promise
 */
export function getInflight(key: string): Promise<DiscoveredData> | undefined {
	return _inflight.get(key);
}

/**
 * Set in-flight promise
 */
export function setInflight(key: string, promise: Promise<DiscoveredData>): void {
	_inflight.set(key, promise);
}

/**
 * Delete in-flight promise
 */
export function deleteInflight(key: string): void {
	_inflight.delete(key);
}

/**
 * Clear all cached data for a different cache key
 * This ensures that when credentials change, old learned data is removed
 */
export function clearOtherCaches(ctx: ILoadOptionsFunctions, excludeCurrentKey: string): void {
	try {
		const sd = ctx.getWorkflowStaticData('node') as WorkflowStaticData;
		const bag = sd.sharetribeDiscovered || {};
		const keysToDelete: string[] = [];

		for (const key in bag) {
			if (key !== excludeCurrentKey) {
				keysToDelete.push(key);
			}
		}

		if (keysToDelete.length > 0) {
			for (const key of keysToDelete) {
				delete bag[key];
				_memCache.delete(key);
			}
			sd.sharetribeDiscovered = bag;
			sd.__dataChanged = true;
			ctx.logger.info(`[Sharetribe] Cleared ${keysToDelete.length} old cache entries`);
		}
	} catch {
		// Silent fail - cache cleanup is optional
	}
}
