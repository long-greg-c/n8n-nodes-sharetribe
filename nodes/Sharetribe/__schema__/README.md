# Sharetribe Node Output Schemas

This directory contains JSON Schema definitions for the Sharetribe node's output structure. These schemas enable n8n to provide output preview and better autocomplete suggestions when working with Sharetribe data.

The schema's are auto generated with `npm run generate:schemas`. They are also generated on a `npm run build`.

## Structure

```
__schema__/
└── v1/                                    # Version 1 schemas
    ├── user/
    │   ├── get.json                       # Single user response
    │   └── getMany.json                   # Multiple users response
    ├── listing/
    │   ├── get.json                       # Single listing with full details
    │   ├── getMany.json                   # Multiple listings (minimal fields)
    │   ├── create.json                    # Created listing response
    │   └── update.json                    # Updated listing response
    ├── transaction/
    │   ├── get.json                       # Single transaction with full details
    │   └── getMany.json                   # Multiple transactions (minimal fields)
    ├── stock/
    │   └── getMany.json                   # Stock adjustments response
    ├── availabilityExceptions/
    │   ├── getMany.json                   # Availability exceptions list
    │   ├── create.json                    # Created exception response
    │   └── delete.json                    # Delete confirmation
    ├── marketplace/
    │   └── get.json                       # Marketplace information
    └── image/
        └── upload.json                    # Uploaded image response
```

## Schema Format

Each schema file follows JSON Schema format and defines the structure of data returned by the corresponding operation:

- **get operations**: Full resource with all attributes and relationships
- **getMany operations**: Minimal resource fields (optimized for lists)
- **create/update operations**: Created/updated resource response
- **delete operations**: Success confirmation

## Key Differences: get vs getMany

### get (Single Resource)

- Returns full resource with all available attributes
- Includes relationships (author, images, marketplace, etc.)
- Contains `included` array with expanded relationship data
- Contains extended data fields (publicData, privateData, protectedData, metadata)

### getMany (Multiple Resources)

- Returns minimal fields for performance
- Only core attributes (id, type, basic fields)
- No relationships or included data by default
- Optimized for list views and queries

## Adding New Schemas

When adding new operations:

1. Create schema file: `__schema__/v1/{resource}/{operation}.json`
2. Follow existing patterns for get/getMany/create/update/delete
3. Use proper JSON Schema types (string, integer, object, array, boolean, null)
4. Include `"version": 1` at root level
5. Build will automatically copy to `dist/`

## Example Schema Structure

```json
{
	"type": "object",
	"properties": {
		"id": { "type": "string" },
		"type": { "type": "string" },
		"attributes": {
			"type": "object",
			"properties": {
				"title": { "type": "string" },
				"createdAt": { "type": "string" }
			}
		}
	},
	"version": 1
}
```

## Benefits

- **IDE Autocomplete**: Better code completion in n8n expressions
- **Type Safety**: Validates output structure matches expectations
- **Documentation**: Self-documenting API responses
- **Preview**: n8n can show output preview before execution
