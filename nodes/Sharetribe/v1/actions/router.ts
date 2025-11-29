/**
 * Router - Main execution dispatcher for Sharetribe node operations
 *
 * ## n8n Execution Pipeline
 *
 * This router is called by SharetribeV1.execute() and serves as the central dispatcher
 * for all Sharetribe operations. It's part of n8n's execution flow:
 *
 * 1. **Workflow triggers** - User executes workflow in n8n
 * 2. **Node receives input** - Input items flow into this node
 * 3. **Router processes each item** - This function routes to resource-specific handlers
 * 4. **Execute functions run** - Resource/operation execute files handle API calls
 * 5. **Results normalized** - Sharetribe API responses converted to n8n format
 * 6. **Output returned** - Processed data flows to next node in workflow
 *
 * ## Architecture
 *
 * The router follows n8n's resource/operation pattern:
 * - **Resources**: user, listing, transaction, marketplace, image, stock, availabilityExceptions
 * - **Operations**: get, getMany, create, update, delete, etc.
 *
 * Each resource module exports operation objects with execute functions:
 * ```typescript
 * // Example structure
 * resource.operation.execute.call(this, itemIndex) -> IDataObject[]
 * ```
 *
 * ## Error Handling
 *
 * - **continueOnFail=true**: Errors captured, original input passed through with error metadata
 * - **continueOnFail=false**: Errors enriched with context (resource, operation, itemIndex) and thrown
 *
 * @param this - n8n execution context with helpers and parameter accessors
 * @returns Array of execution results (n8n always expects array of arrays for multi-output nodes)
 */

import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';

import type { Sharetribe } from './Interfaces';
import * as user from './user';
import * as listing from './listing';
import * as transaction from './transaction';
import * as marketplace from './marketplace';
import * as image from './image';
import * as availabilityExceptions from './availabilityExceptions';
import * as stock from './stock';

/**
 * Interface for operation execute function signature
 */
interface OperationExecute {
	execute: (this: IExecuteFunctions, itemIndex: number) => Promise<IDataObject | IDataObject[]>;
}

/**
 * Interface for resource modules that export operations
 * Modules may also export 'descriptions' property, so we use unknown for the index signature
 */
interface ResourceModule {
	[operation: string]: OperationExecute | unknown;
}

/**
 * Routes execution to appropriate resource handler based on user-selected resource and operation
 */
async function executeOperation(
	context: IExecuteFunctions,
	resource: Sharetribe['resource'],
	operation: string,
	itemIndex: number,
): Promise<IDataObject | IDataObject[]> {
	switch (resource) {
		case 'user':
			return await ((user as ResourceModule)[operation] as OperationExecute).execute.call(context, itemIndex);
		case 'listing':
			return await ((listing as ResourceModule)[operation] as OperationExecute).execute.call(context, itemIndex);
		case 'transaction':
			return await ((transaction as ResourceModule)[operation] as OperationExecute).execute.call(context, itemIndex);
		case 'marketplace':
			return await ((marketplace as ResourceModule)[operation] as OperationExecute).execute.call(context, itemIndex);
		case 'image':
			return await ((image as ResourceModule)[operation] as OperationExecute).execute.call(context, itemIndex);
		case 'availabilityExceptions':
			// Special case: 'delete' is a reserved keyword, exported as 'deleteException'
			if (operation === 'delete') {
				return await availabilityExceptions.deleteException.execute.call(context, itemIndex);
			}
			return await ((availabilityExceptions as ResourceModule)[operation] as OperationExecute).execute.call(context, itemIndex);
		case 'stock':
			return await ((stock as ResourceModule)[operation] as OperationExecute).execute.call(context, itemIndex);
		default:
			throw new Error(`Unknown resource: ${resource}`);
	}
}

/**
 * Processes a single input item through the resource operation
 */
async function processItem(
	context: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const resource = context.getNodeParameter('resource', itemIndex) as Sharetribe['resource'];
	const operation = context.getNodeParameter('operation', itemIndex) as string;

	try {
		const responseData = await executeOperation(context, resource, operation, itemIndex);

		return context.helpers.constructExecutionMetaData(
			context.helpers.returnJsonArray(responseData),
			{ itemData: { item: itemIndex } },
		);
	} catch (error) {
		// If continueOnFail is enabled, return the original input with error metadata
		if (context.continueOnFail()) {
			return [
				{
					json: context.getInputData(itemIndex)[0].json,
					error,
					pairedItem: { item: itemIndex },
				},
			];
		}

		// Enrich error with execution context for debugging
		if (error.context) {
			error.context.itemIndex = itemIndex;
			error.context.resource = resource;
			error.context.operation = operation;
		}
		throw error;
	}
}

/**
 * Main router function - processes all input items and dispatches to resource handlers
 */
export async function router(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
	const items = this.getInputData();
	const results: INodeExecutionData[] = [];

	for (let i = 0; i < items.length; i++) {
		const itemResults = await processItem(this, i);
		results.push(...itemResults);
	}

	return [results];
}
