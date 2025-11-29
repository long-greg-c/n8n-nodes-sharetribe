/**
 * Generate JSON schema files from TypeScript types
 * This ensures __schema__ JSON files stay in sync with types.ts
 */

/* eslint-disable @n8n/community-nodes/no-restricted-imports */
/* eslint-disable @n8n/community-nodes/no-restricted-globals */
/* eslint-disable no-console */

import * as fs from 'fs';
import * as path from 'path';

const SCHEMA_VERSION = 1;
const SCHEMA_BASE_PATH = path.join(__dirname, '../nodes/Sharetribe/__schema__/v1');

/**
 * Base JSON:API resource schema structure
 */
interface JsonSchemaProperty {
	type?: string | string[];
	properties?: Record<string, JsonSchemaProperty>;
	items?: JsonSchemaProperty;
	[key: string]: unknown;
}

interface BaseResourceSchema {
	type: 'object';
	properties: {
		id: { type: 'string' };
		type: { type: 'string' };
		attributes?: { type: 'object'; properties: Record<string, JsonSchemaProperty> };
		relationships?: { type: 'object'; properties: Record<string, JsonSchemaProperty> };
		included?: { type: 'array'; items: { type: 'object' } };
	};
	version: number;
}

/**
 * User resource schema
 */
const userSchema: BaseResourceSchema = {
	type: 'object',
	properties: {
		id: { type: 'string' },
		type: { type: 'string' },
		attributes: {
			type: 'object',
			properties: {
				banned: { type: 'boolean' },
				createdAt: { type: 'string' },
				deleted: { type: 'boolean' },
				email: { type: 'string' },
				emailVerified: { type: 'boolean' },
				pendingEmail: { type: ['string', 'null'] },
				profile: {
					type: 'object',
					properties: {
						abbreviatedName: { type: 'string' },
						bio: { type: ['string', 'null'] },
						displayName: { type: 'string' },
						firstName: { type: 'string' },
						lastName: { type: 'string' },
						publicData: { type: 'object' },
						protectedData: { type: 'object' },
						privateData: { type: 'object' },
						metadata: { type: 'object' },
					},
				},
				state: { type: 'string' },
				stripeConnected: { type: 'boolean' },
				stripePayoutsEnabled: { type: 'boolean' },
				stripeChargesEnabled: { type: 'boolean' },
				identityProviders: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							idpId: { type: 'string' },
							userId: { type: 'string' },
						},
					},
				},
				metadata: { type: 'object' },
			},
		},
		relationships: {
			type: 'object',
			properties: {
				marketplace: {
					type: 'object',
					properties: {
						data: { type: 'object' },
					},
				},
				profileImage: {
					type: 'object',
					properties: {
						data: { type: ['object', 'null'] },
					},
				},
				stripeAccount: {
					type: 'object',
					properties: {
						data: { type: ['object', 'null'] },
					},
				},
				effectivePermissionSet: {
					type: 'object',
					properties: {
						data: { type: 'object' },
					},
				},
			},
		},
		included: {
			type: 'array',
			items: { type: 'object' },
		},
	},
	version: SCHEMA_VERSION,
};

/**
 * Listing resource schema
 */
const listingSchema: BaseResourceSchema = {
	type: 'object',
	properties: {
		id: { type: 'string' },
		type: { type: 'string' },
		attributes: {
			type: 'object',
			properties: {
				title: { type: 'string' },
				description: { type: 'string' },
				availabilityPlan: { type: ['object', 'null'] },
				createdAt: { type: 'string' },
				deleted: { type: 'boolean' },
				geolocation: { type: ['object', 'null'] },
				metadata: { type: 'object' },
				price: {
					type: 'object',
					properties: {
						amount: { type: 'integer' },
						currency: { type: 'string' },
					},
				},
				privateData: { type: 'object' },
				protectedData: { type: 'object' },
				publicData: { type: 'object' },
				state: { type: 'string' },
			},
		},
		relationships: {
			type: 'object',
			properties: {
				author: {
					type: 'object',
					properties: {
						data: { type: 'object' },
					},
				},
				images: {
					type: 'object',
					properties: {
						data: {
							type: 'array',
							items: { type: 'object' },
						},
					},
				},
				marketplace: {
					type: 'object',
					properties: {
						data: { type: 'object' },
					},
				},
				currentStock: {
					type: 'object',
					properties: {
						data: { type: ['object', 'null'] },
					},
				},
			},
		},
		included: {
			type: 'array',
			items: { type: 'object' },
		},
	},
	version: SCHEMA_VERSION,
};

/**
 * Transaction resource schema
 */
const transactionSchema: BaseResourceSchema = {
	type: 'object',
	properties: {
		id: { type: 'string' },
		type: { type: 'string' },
		attributes: {
			type: 'object',
			properties: {
				createdAt: { type: 'string' },
				lastTransition: { type: 'string' },
				lastTransitionedAt: { type: 'string' },
				lineItems: {
					type: 'array',
					items: { type: 'object' },
				},
				metadata: { type: 'object' },
				payinTotal: {
					type: 'object',
					properties: {
						amount: { type: 'integer' },
						currency: { type: 'string' },
					},
				},
				payoutTotal: {
					type: 'object',
					properties: {
						amount: { type: 'integer' },
						currency: { type: 'string' },
					},
				},
				processName: { type: 'string' },
				processVersion: { type: 'integer' },
				protectedData: { type: 'object' },
				state: { type: 'string' },
				transitions: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							at: { type: 'string' },
							by: { type: 'string' },
							transition: { type: 'string' },
						},
					},
				},
			},
		},
		relationships: {
			type: 'object',
			properties: {
				customer: {
					type: 'object',
					properties: {
						data: { type: 'object' },
					},
				},
				provider: {
					type: 'object',
					properties: {
						data: { type: 'object' },
					},
				},
				listing: {
					type: 'object',
					properties: {
						data: { type: 'object' },
					},
				},
				booking: {
					type: 'object',
					properties: {
						data: { type: ['object', 'null'] },
					},
				},
				reviews: {
					type: 'object',
					properties: {
						data: {
							type: 'array',
							items: { type: 'object' },
						},
					},
				},
				messages: {
					type: 'object',
					properties: {
						data: {
							type: 'array',
							items: { type: 'object' },
						},
					},
				},
			},
		},
		included: {
			type: 'array',
			items: { type: 'object' },
		},
	},
	version: SCHEMA_VERSION,
};

/**
 * Stock adjustment resource schema (for getMany endpoint)
 */
const stockAdjustmentSchema: BaseResourceSchema = {
	type: 'object',
	properties: {
		id: { type: 'string' },
		type: { type: 'string' },
		attributes: {
			type: 'object',
			properties: {
				at: { type: 'string' },
				quantity: { type: 'integer' },
			},
		},
		relationships: {
			type: 'object',
			properties: {
				listing: {
					type: 'object',
					properties: {
						data: {
							type: 'object',
							properties: {
								id: { type: 'string' },
								type: { type: 'string' },
							},
						},
					},
				},
				stockReservation: {
					type: 'object',
					properties: {
						data: { type: ['object', 'null'] },
					},
				},
			},
		},
	},
	version: SCHEMA_VERSION,
};

/**
 * Availability exception resource schema
 */
const availabilityExceptionSchema: BaseResourceSchema = {
	type: 'object',
	properties: {
		id: { type: 'string' },
		type: { type: 'string' },
		attributes: {
			type: 'object',
			properties: {
				start: { type: 'string' },
				end: { type: 'string' },
				seats: { type: 'integer' },
			},
		},
		relationships: {
			type: 'object',
			properties: {
				listing: {
					type: 'object',
					properties: {
						data: { type: 'object' },
					},
				},
			},
		},
	},
	version: SCHEMA_VERSION,
};

/**
 * Marketplace resource schema
 */
const marketplaceSchema: BaseResourceSchema = {
	type: 'object',
	properties: {
		id: { type: 'string' },
		type: { type: 'string' },
		attributes: {
			type: 'object',
			properties: {
				name: { type: 'string' },
				url: { type: 'string' },
				currency: { type: 'string' },
				timezone: { type: 'string' },
				distanceUnit: { type: 'string' },
			},
		},
	},
	version: SCHEMA_VERSION,
};

/**
 * Image resource schema
 */
const imageSchema: BaseResourceSchema = {
	type: 'object',
	properties: {
		id: { type: 'string' },
		type: { type: 'string' },
		attributes: {
			type: 'object',
			properties: {
				variants: {
					type: 'object',
					additionalProperties: {
						type: 'object',
						properties: {
							name: { type: 'string' },
							width: { type: 'integer' },
							height: { type: 'integer' },
							url: { type: 'string' },
						},
					},
				},
			},
		},
	},
	version: SCHEMA_VERSION,
};

/**
 * Write schema to file
 */
function writeSchema(resourcePath: string, operation: string, schema: BaseResourceSchema): void {
	const dir = path.join(SCHEMA_BASE_PATH, resourcePath);
	const filePath = path.join(dir, `${operation}.json`);

	// Create directory if it doesn't exist
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}

	// Write schema file
	fs.writeFileSync(filePath, JSON.stringify(schema, null, '\t') + '\n', 'utf8');
	console.log(`✓ Generated ${resourcePath}/${operation}.json`);
}

/**
 * Generate all schema files
 */
function generateSchemas(): void {
	console.log('Generating JSON schema files from TypeScript types...\n');

	// User schemas
	writeSchema('user', 'get', userSchema);
	writeSchema('user', 'getMany', userSchema);

	// Listing schemas
	writeSchema('listing', 'get', listingSchema);
	writeSchema('listing', 'getMany', listingSchema);
	writeSchema('listing', 'create', listingSchema);
	writeSchema('listing', 'update', listingSchema);

	// Transaction schemas
	writeSchema('transaction', 'get', transactionSchema);
	writeSchema('transaction', 'getMany', transactionSchema);

	// Stock schemas
	writeSchema('stock', 'getMany', stockAdjustmentSchema);

	// Availability exception schemas
	writeSchema('availabilityExceptions', 'getMany', availabilityExceptionSchema);
	writeSchema('availabilityExceptions', 'create', availabilityExceptionSchema);
	writeSchema('availabilityExceptions', 'delete', availabilityExceptionSchema);

	// Marketplace schema
	writeSchema('marketplace', 'get', marketplaceSchema);

	// Image schema
	writeSchema('image', 'upload', imageSchema);

	console.log('\n✓ All schema files generated successfully!');
}

// Run the generator
generateSchemas();
