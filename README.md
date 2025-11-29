# n8n-nodes-sharetribe

This is an n8n community node. It lets you use Sharetribe in your n8n workflows.

> Requires the 'Pro' or 'Extend' plan to access the Sharetribe [Integration API](https://www.sharetribe.com/docs/introduction/getting-started-with-integration-api/).

Sharetribe is a platform for building online marketplaces where users can buy and sell products or services. It provides APIs for managing users, listings, transactions, and more in marketplace applications.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  
[Compatibility](#compatibility)  
[Usage](#usage)  
[Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

### Sharetribe Events Node

The events node listens for real-time events from your Sharetribe marketplace:

- **Listing Events**: Created, updated, approved, published, closed
- **User Events**: Created, updated, approved, banned
- **Transaction Events**: Created, transitioned, updated
- **Message Events**: Created in transactions
- **Booking Events**: Created, updated, cancelled
- **Review Events**: Created, updated

### Sharetribe Node

#### User Operations

- **Get User**: Retrieve a single user by ID
- **Get Many Users**: Query multiple users with filtering and pagination
- **Update User**: Update user profile information
- **Delete User**: Delete a user account

#### Listing Operations

- **Get Listing**: Retrieve a single listing by ID
- **Query Listings**: Search and filter listings with pagination
- **Create Listing**: Create a new marketplace listing
- **Update Listing**: Update existing listing information
- **Delete Listing**: Remove a listing from the marketplace
- **Approve Listing**: Approve a pending listing
- **Close Listing**: Close an active listing
- **Open Listing**: Reopen a closed listing

#### Transaction Operations

- **Get Transaction**: Retrieve a single transaction by ID
- **Get Many Transactions**: Query transactions with filtering and pagination
- **Transition Transaction**: Move transaction to next state in process
- **Speculative Transition**: Preview transition without executing
- **Update Metadata**: Update transaction metadata

#### Stock Operations

- **Query Adjustments**: Retrieve stock adjustment history
- **Create Adjustment**: Add or remove stock quantity
- **Show Reservation**: Get stock reservation details

#### Message Operations

- **Create Message**: Send a message in a transaction
- **Query Messages**: Retrieve messages with filtering

#### Review Operations

- **Create Review**: Submit a review for a transaction
- **Query Reviews**: Search and filter reviews
- **Show Review**: Get a single review by ID

## Credentials

To use this node, you need to supply the Client ID and Secret for the Sharetribe Integration API
and the Client ID for the Sharetribe Marketplace API:

1. **Create a Sharetribe Application for Integration API**:
   - Log into your Sharetribe Console
   - Navigate to your marketplace settings
   - Go to "Advanced" > "Applications"
   - Create a new 'Integration API' application and note the Client ID and Secret

2. **Create a Sharetribe Application for Marketplace API**:
   - **Note**: You can use an existing Marketplace API Client ID. The secret is not needed.
   - Log into your Sharetribe Console
   - Navigate to your marketplace settings
   - Go to "Advanced" > "Applications"
   - Create a new 'Marketplace API' application and note the Client ID

3. **Set up OAuth2 Credentials in n8n**:
   - Create new credentials of type "Sharetribe Integration API"
   - Enter your Client ID and Client Secret
   - Enter the Marketplace Client ID
   - The node will handle the OAuth2 flow automatically

// TODO: add note about the auto-populate and how it caches

## Compatibility

- **Minimum n8n version**: 1.0.0
- **Tested with**: n8n versions 1.0.0+
- **Sharetribe API**: Compatible with Sharetribe (Integration API and Marketplace API)

## Usage

### Response Configuration

All operations support flexible response configuration to optimize API response sizes, query times and efficient data use in n8n.
Return only the attributes you need.

- **Attributes to Return**: Select specific fields to include in responses.
- **Result Modes** (for query operations):
  - **Return All Matches**: Fetch all results with automatic pagination.
  - **Limit Matches**: Return up to a specified number of results (default: 50).
  - **Totals Only**: Return only count information for performance.

### Filtering and Sorting

Get Many operations support extensive filtering:

- **Date ranges**: Filter by creation dates, last transition dates
- **States**: Filter by user/listing/transaction states
- **Extended data**: Filter by custom metadata, public/private data attributes
- **Relationships**: Filter by related entities (author, customer, provider)

### Normalization

All API responses are automatically normalized to flatten Sharetribe's nested JSON structure, making data easier to work with in n8n workflows.

### Event Handling

The events node supports field selection to control which event data is returned:

- **Resource**: Include the main resource (listing, user, transaction)
- **Previous Values**: Include previous values for update events
- **Related Resources**: Include related entities based on event type

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [Sharetribe](https://www.sharetribe.com/)
- [Sharetribe API Documentation](https://www.sharetribe.com/api-reference/integration.html)
- [Sharetribe Console](https://console.sharetribe.com/)

## License

[MIT](LICENSE.md)

## Development

See [DEVELOPMENT.md](DEVELOPMENT.md)
