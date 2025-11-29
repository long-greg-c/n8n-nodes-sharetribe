import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { adjust } from '../forceSet/execute';
import { compareAndSet } from '../safelySet/execute';

const STOCK_MODE = {
	FORCE_SET: 'forceSet',
	SAFELY_SET: 'safelySet',
} as const;

/**
 * Wrapper that routes to the appropriate stock update operation based on mode parameter
 */
export async function updateStockQuantity(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const mode = this.getNodeParameter('mode', index) as string;

	if (mode === STOCK_MODE.FORCE_SET) {
		return adjust.call(this, index);
	} else if (mode === STOCK_MODE.SAFELY_SET) {
		return compareAndSet.call(this, index);
	}

	throw new Error(`Unknown stock update mode: ${mode}`);
}
