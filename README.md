# Monday.com MCP Server for Dify.ai

A Model Context Protocol (MCP) server that integrates Monday.com with Dify.ai, allowing AI agents to interact with Monday.com boards through natural language commands.

## Features

- **MCP Protocol Compliance**: Full JSON-RPC 2.0 implementation
- **Monday.com Integration**: Three main tools for board operations
- **Dify.ai Compatible**: Optimized for Dify.ai's MCP client
- **Fast Response**: Minimal latency for real-time interactions

## Tools Available

1. **get_board_items_by_name**: Find items by name in a Monday.com board
2. **change_item_column_values**: Update column values for an item
3. **get_board_schema**: Get board schema including columns

## Quick Deploy to Railway

1. **Fork/Clone this repository**
2. **Go to [Railway.app](https://railway.app)**
3. **Sign up with GitHub**
4. **Click "New Project" → "Deploy from GitHub repo"**
5. **Select this repository**
6. **Railway will automatically deploy and give you a URL**

## Environment Variables

Create a `.env` file (optional for basic functionality):

```env
PORT=3000
MONDAY_API_TOKEN=your_monday_api_token_here
```

## Local Development

```bash
# Install dependencies
npm install

# Start the server
npm start

# The server will be available at http://localhost:3000
```

## API Endpoints

- `GET /health` - Health check
- `POST /` - MCP protocol endpoint

## MCP Protocol

This server implements the Model Context Protocol (MCP) with the following methods:

- `initialize` - Initialize the MCP connection
- `tools/list` - List available tools
- `tools/call` - Execute a tool
- `notifications/initialized` - Handle initialization notification

## License

MIT 