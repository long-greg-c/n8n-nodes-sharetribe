/**
 * Load Options - Auto-populate static dropdown options list
 *
 */

import { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
import { FALLBACK_BOOKING_STATES, getDiscoveredData, toOptions } from './shared';
import { CurrencyCode } from '../constants';

export async function getBookingStates(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	this.logger.info('[Sharetribe] loadOptions.getBookingStates called');
	const force = !!this.getCurrentNodeParameter?.('refreshDiscoveredData');
	const discovered = await getDiscoveredData.call(this, { forceRefresh: force });
	const source = discovered.bookingStates.size
		? discovered.bookingStates
		: new Set(FALLBACK_BOOKING_STATES);
	return toOptions(source);
}

export async function getCurrencyCodes(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	this.logger.info('[Sharetribe] loadOptions.getCurrencyCodes called');
	return Object.values(CurrencyCode).map(code => ({
		name: code,
		value: code,
	}));
}
