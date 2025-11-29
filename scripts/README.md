# Scripts

## Schema Generation

### generateSchemas.ts

Automatically generates JSON schema files in `nodes/Sharetribe/__schema__/v1/` from the TypeScript types defined in `nodes/Sharetribe/v1/types.ts`.

This ensures the schema files (used by n8n for response validation and IDE support) always stay in sync with the TypeScript type definitions.

**Usage:**

```bash
npm run generate:schemas
```

**When schemas are generated:**

- Automatically runs before every build (`npm run build`)
- Can be run manually anytime with `npm run generate:schemas`

**What gets generated:**

The script creates JSON schema files for all Sharetribe API resources:

- User: `user/get.json`, `user/getMany.json`
- Listing: `listing/get.json`, `listing/getMany.json`, `listing/create.json`, `listing/update.json`
- Transaction: `transaction/get.json`, `transaction/getMany.json`
- Stock: `stock/getMany.json`
- Availability Exceptions: `availabilityExceptions/getMany.json`, `availabilityExceptions/create.json`, `availabilityExceptions/delete.json`
- Marketplace: `marketplace/get.json`
- Image: `image/upload.json`

**Benefits:**

✅ **Single Source of Truth** - Types defined once in `types.ts`, schemas generated automatically
✅ **No Manual Sync** - Schema files always match TypeScript types
✅ **Build Integration** - Runs automatically during build process
✅ **Type Safety** - Ensures JSON schemas accurately reflect the API structure
