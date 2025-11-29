import type {
	IDataObject,
	IPollFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

import moment from 'moment';

import { sharetribeApiRequest, normalizeSharetribeResponse } from './v1/GenericFunctions';
import { triggerProperties } from './SharetribeTrigger.description';

export class SharetribeTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Sharetribe Trigger',
		name: 'sharetribeTrigger',
		icon: {
			light: 'file:../../icons/sharetribe.svg',
			dark: 'file:../../icons/sharetribe.dark.svg',
		},
		group: ['trigger'],
		version: 1,
		description: 'Poll Sharetribe Flex for events',
		defaults: { name: 'Sharetribe Trigger' },
		polling: true,
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'sharetribeOAuth2Api',
				required: true,
			},
		],
		properties: triggerProperties,
		usableAsTool: true,
	};

	async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
		// Data stored using node-level static data is only accessible to the node
		// that set it. Useful for persisting information like the last polled sequence ID
		// or timestamp between executions, but only for that specific node.
		// Meaning multiple trigger nodes can exist in the same workflow without
		// interfering with each other's poll tracking.
		const nodeStaticData = this.getWorkflowStaticData('node');
		const resource = this.getNodeParameter('resource', 0) as string;

		// Get event types
		const capitalized = resource.charAt(0).toUpperCase() + resource.slice(1);
		const paramName = `eventTypes${capitalized}`;
		const eventTypes = this.getNodeParameter(paramName, 0) as string[];

		const eventAttributes = this.getNodeParameter('eventAttributes', 0) as string[];
		const startQueryMode = this.getNodeParameter('startQueryMode', 0) as string;

		// Get resource filter - only available for specific resources, not for 'all'
		let resourceFilter = 'none';
		if (resource !== 'all') {
			resourceFilter = this.getNodeParameter('resourceFilter', 0, { extractValue: true }) as string;
		}

		const now = moment().utc().toISOString();
		const end = now;

		//
		const lastCheckedAt = (nodeStaticData.lastCheckedAt as string) || now;
		this.logger.info(`last checked at: ${JSON.stringify(lastCheckedAt)}`);

		try {
			const query: IDataObject = {};

			// Handle query start based on mode
			if (startQueryMode === 'specificTime') {
				const startTime = this.getNodeParameter('startTime', 0) as string;
				if (startTime) {
					query.createdAtStart = startTime;
				}
			} else if (startQueryMode === 'sequenceId') {
				const sequenceId = this.getNodeParameter('startAfterSequenceId', 0) as number;
				if (sequenceId > 0) {
					query.startAfterSequenceId = sequenceId;
				}
			} else if (startQueryMode === 'lastPoll') {
				if (this.getMode() === 'manual') {
					this.logger.info(`Manual mode`);
				} else if (lastCheckedAt) {
					query.createdAtStart = lastCheckedAt;
				}
			}
			// For 'allEvents' mode, don't add any time/sequence filters

			if (eventTypes.length > 0) {
				query.eventTypes = eventTypes.join(',');
			}
			if (eventAttributes.length > 0) {
				query['fields.event'] = eventAttributes.join(',');
			}

			// Handle resource filtering
			if (resourceFilter === 'resourceId') {
				const resourceId = this.getNodeParameter('resourceId', 0) as string;
				if (resourceId) {
					query.resourceId = resourceId;
				}
			} else if (resourceFilter === 'relatedResourceId') {
				const relatedResourceId = this.getNodeParameter('relatedResourceId', 0) as string;
				if (relatedResourceId) {
					query.relatedResourceId = relatedResourceId;
				}
			}
			this.logger.info(`Polling Sharetribe with params: ${JSON.stringify(query)}`);
			const res = await sharetribeApiRequest.call(this, 'GET', '/events/query', {}, query);
			nodeStaticData.lastCheckedAt = end;
			const events = (Array.isArray(res?.data) ? res.data : []) as IDataObject[];
			this.logger.error(`Response from Sharetribe: ${JSON.stringify(res)}`);

			if (!events.length) {
				this.logger.info(`No new events`);
				return null;
			}

			const normalizedEvents = normalizeSharetribeResponse(events);
			const items = this.helpers.returnJsonArray(normalizedEvents);
			return [items];
		} catch (e) {
			this.logger.error(`Response from Sharetribe: ${JSON.stringify(e)}`);
			return null;
		}
	}
}
