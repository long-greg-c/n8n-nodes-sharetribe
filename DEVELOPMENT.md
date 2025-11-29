# Development

This document explains how to set up a local development environment for this node.

---

## Prerequisites

You’ll need:

- **Node.js (20.19 and 24.x (inclusive)) and npm** installed.
- A local n8n instance (run automatically, see below).

---

## Development (run n8n with this node)

First run

```bash
npm install
```

Build only the Sharetribe node, output is in the `/dist` folder:

```bash
npm run build
```

Start a local n8n instance with this node loaded and auto‑rebuild on changes:

```bash
npm run dev
```

This runs [n8n-node CLI](https://www.npmjs.com/package/@n8n/node-cli) via npm which:

1. Compiles the project
2. Starts a local n8n instance (via npm) with the node loaded.
3. Then visit: http://localhost:5678

### Debugging

Run with debugging on breakpoints. A `launch.json` for VSCode is already setup.
Set breakpoints and F5 to launch n8n with the custom node and debugger attached.

### Testing

// TODO: Still need to add unit tests and complete the workflow import run, validate scripts

Testing this node is achieved by

1. Running pre-defined workflows that exercise all the functionality of the node.
2. Running unit tests on `GenericFunctions` using Jest.

```bash
npm run test
```

This will:

1. Run all unit tests.
2. Start up a fresh instance of n8n.
3. Import `credentials` into the n8n instance. Credentials are for a Sharetribe instance - where the Client ID and Client Secret are stored in `.env`.
4. Import the test workflows into the n8n instance.
5. Execute all the workflows.
6. Check the result of all the workflow executions.

---

## Search Filters Caching

When "Auto Populate Search Filters" is enabled in the credentials, the node automatically discovers available options (process names, states, transitions, extended data fields) by analyzing recent resources from the marketplace.

### How Caching Works

1. **Initial Discovery**: On first use, fetches recent resources from three sources in parallel:
   - **Transactions**: 10 most recent (learns process names, states, transitions, booking states, extended data), also includes listings and transactions.
   - **Listings**: 10 most recent (learns extended data fields)
   - **Users**: 10 most recent (learns extended data fields)
2. **Incremental Updates**: When cache expires, default 5 mins, only fetches new resources created since the last check
3. **Timestamp Tracking**: Tracks the most recent timestamp for each resource type independently
4. **Parallel Fetching**: All three resource types are queried simultaneously for optimal performance
5. **Two-Tier Cache**:
   - **Memory cache**: Fast, cleared on n8n restart
   - **Workflow static data**: Persistent across executions

### Cache Lifecycle

- **Cache TTL**: Configurable in credentials (default: 5 minutes)
- **On credential change**: Old learned data is automatically cleared and repopulated
- **On cache expiry**: Performs incremental fetch of only new resources from all three sources

### Discovery Configuration

Discovery settings are configurable in the credential settings:

- **Discovery Resource Limit**: Number of resources to fetch from each type (default: 10)
  - Applies to transactions, listings, and users
  - Higher values provide better discovery but increase processing time
  - Range: 1-100
- **Discovery Cache TTL**: How long to cache discovered data before checking for updates (default: 5 minutes)
  - Lower values keep data fresher but increase API calls
  - Range: 1-60 minutes

Default values are also available in [constants.ts](nodes/Sharetribe/v1/constants.ts#L787-L816) as fallbacks.

### Cache Key

Cache key is based on:

- Base URL
- Integration API Client ID
- Marketplace API Client ID
- Enable Dynamic Learning setting
- Discovery Resource Limit
- Discovery Cache TTL

When any of these change, the old cache is automatically cleared.

---

## Using n8n CLI commands

When `npm run dev` is running, you may need to run [n8n CLI](https://docs.n8n.io/hosting/cli-commands/) commands against the same n8n instance.
This allows importing workflows, running workflows etc.
Use the `npm run n8n` script which automatically points to the correct n8n instance:

```bash
# Import workflows
npm run import:workflows

# Execute workflow by its ID
npm run n8n execute --id <ID>

# Or run any n8n CLI command
npm run n8n -- export:workflow --all --output=./backup
npm run n8n -- user:list
npm run n8n -- credential:list
```

The `npm run n8n` script:

- Uses `npx n8n@latest` (same version as `n8n-node dev`)
- Sets `N8N_USER_FOLDER=$HOME/.n8n-node-cli` (same data folder as `n8n-node dev`)
- Ensures all CLI commands work with your dev instance data

# Lint

Check code style and common issues:

```
npm run lint
```

This runs the n8n-node lint command for this project.

# Release (optional, for npm publishing)

If you plan to update this package on npm:

```bash
npm run release
```

This maps to n8n-node release, which uses release-it to cleanly build and publish the package.

# Where data is stored during development

When running `npm run dev`, two different tools store data in different locations:

## 1. n8n-node-cli data

The `n8n-node-cli` tool (which wraps the n8n instance) stores its own data at:

```bash
~/.n8n-node-cli/
```

This includes cache files and other CLI-specific data.

## 2. n8n instance data

The n8n instance itself stores user data (encryption key, SQLite database, workflows, credentials, etc.) at:

```bash
~/.n8n-node-cli/.n8n/
```

By default, this is created inside the n8n-node-cli folder.

## Customizing data locations

You can control where n8n stores its data using CLI flags:

### Using --custom-user-folder flag

Pass the flag directly to `n8n-node dev`:

```bash
n8n-node dev --custom-user-folder /path/to/custom/folder
```

### Important: Avoiding circular symlinks

**Do not** set the custom folder to be inside this repository. When `n8n-node dev` runs, it creates a symlink to this package inside the n8n user data folder at `.n8n/custom/node_modules/`. If the data folder is inside this repo, it creates an infinite loop.

## Cleaning development data

To reset your development environment:

```bash
npm run clean:n8n
```

This removes `~/.n8n-node-cli` (including the n8n instance data inside it).

# Core nodes vs this package

- Core nodes are part of the main n8n repository (nodes-base) and ship with n8n itself.
- This repository is a community node package (npm module) that n8n loads at runtime when installed/linked.

The n8n-node tool ensures this package has the expected structure and metadata for n8n to detect and load it correctly.

You do not modify n8n’s core repo to work on this node; all development happens here, and the node is consumed by any n8n instance.
