const { spawn } = require('child_process');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

class SimpleMCPServer {
  constructor() {
    this.mondayApiToken = process.env.MONDAY_API_TOKEN;
    this.mondayBoardId = process.env.MONDAY_BOARD_ID;
    this.emailColumnId = process.env.EMAIL_COLUMN_ID;
    
    if (!this.mondayApiToken) {
      throw new Error('MONDAY_API_TOKEN is required in .env file');
    }
  }

  async handleRequest(request) {
    try {
      const { method, params, id } = request;
      
      switch (method) {
        case 'initialize':
          return this.handleInitialize(params, id);
        case 'tools/list':
          return this.handleToolsList(id);
        case 'tools/call':
          return this.handleToolsCall(params, id);
        default:
          return this.createErrorResponse(id, -32601, `Method ${method} not found`);
      }
    } catch (error) {
      console.error('Error handling request:', error);
      return this.createErrorResponse(request.id, -32603, error.message);
    }
  }

  handleInitialize(params, id) {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {}
        },
        serverInfo: {
          name: 'Monday.com MCP Server',
          version: '1.0.0'
        }
      }
    };
  }

  handleToolsList(id) {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        tools: [
          {
            name: 'get_board_items_by_name',
            description: 'Find items by name in a Monday.com board',
            inputSchema: {
              type: 'object',
              properties: {
                boardId: {
                  type: 'number',
                  description: 'Monday.com board ID'
                },
                term: {
                  type: 'string',
                  description: 'Item name to search for'
                }
              },
              required: ['boardId', 'term']
            }
          },
          {
            name: 'change_item_column_values',
            description: 'Update column values for an item',
            inputSchema: {
              type: 'object',
              properties: {
                boardId: {
                  type: 'number',
                  description: 'Monday.com board ID'
                },
                itemId: {
                  type: 'number',
                  description: 'Item ID to update'
                },
                columnValues: {
                  type: 'string',
                  description: 'JSON string of column values'
                }
              },
              required: ['boardId', 'itemId', 'columnValues']
            }
          },
          {
            name: 'get_board_schema',
            description: 'Get board schema including columns',
            inputSchema: {
              type: 'object',
              properties: {
                boardId: {
                  type: 'number',
                  description: 'Monday.com board ID'
                }
              },
              required: ['boardId']
            }
          }
        ]
      }
    };
  }

  async handleToolsCall(params, id) {
    const { name, arguments: args } = params;
    
    try {
      let result;
      
      switch (name) {
        case 'get_board_items_by_name':
          result = await this.getBoardItemsByName(args.boardId, args.term);
          break;
        case 'change_item_column_values':
          result = await this.changeItemColumnValues(args.boardId, args.itemId, args.columnValues);
          break;
        case 'get_board_schema':
          result = await this.getBoardSchema(args.boardId);
          break;
        default:
          throw new Error(`Tool ${name} not found`);
      }
      
      return {
        jsonrpc: '2.0',
        id,
        result: {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        }
      };
    } catch (error) {
      return this.createErrorResponse(id, -32603, error.message);
    }
  }

  async getBoardItemsByName(boardId, term) {
    const query = `
      query getBoardItemsByName($boardId: ID!, $term: String!) {
        boards(ids: [$boardId]) {
          items_page(query_params: {rules: [{column_id: "name", compare_value: [$term], operator: contains_text}]}) {
            items {
              id
              name
              column_values {
                id
                title
                value
                text
              }
            }
          }
        }
      }
    `;

    const response = await axios.post('https://api.monday.com/v2', {
      query,
      variables: { boardId, term }
    }, {
      headers: {
        'Authorization': this.mondayApiToken,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.errors) {
      throw new Error(`Monday.com API error: ${JSON.stringify(response.data.errors)}`);
    }

    return response.data.data.boards[0].items_page.items;
  }

  async changeItemColumnValues(boardId, itemId, columnValues) {
    const mutation = `
      mutation changeItemColumnValues($boardId: ID!, $itemId: ID!, $columnValues: JSON!) {
        change_multiple_column_values(board_id: $boardId, item_id: $itemId, column_values: $columnValues) {
          id
          name
        }
      }
    `;

    const response = await axios.post('https://api.monday.com/v2', {
      query: mutation,
      variables: { boardId, itemId, columnValues }
    }, {
      headers: {
        'Authorization': this.mondayApiToken,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.errors) {
      throw new Error(`Monday.com API error: ${JSON.stringify(response.data.errors)}`);
    }

    return response.data.data.change_multiple_column_values;
  }

  async getBoardSchema(boardId) {
    const query = `
      query getBoardSchema($boardId: ID!) {
        boards(ids: [$boardId]) {
          columns {
            id
            title
            type
          }
          groups {
            id
            title
          }
        }
      }
    `;

    const response = await axios.post('https://api.monday.com/v2', {
      query,
      variables: { boardId }
    }, {
      headers: {
        'Authorization': this.mondayApiToken,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.errors) {
      throw new Error(`Monday.com API error: ${JSON.stringify(response.data.errors)}`);
    }

    return response.data.data.boards[0];
  }

  createErrorResponse(id, code, message) {
    return {
      jsonrpc: '2.0',
      id,
      error: {
        code,
        message
      }
    };
  }

  start() {
    console.log('✅ Simple Monday.com MCP Server starting...');
    console.log('📋 Dify.ai Configuration:');
    console.log('1. Go to your Dify.ai agent');
    console.log('2. Add MCP Server tool');
    console.log('3. Set command: node simple-mcp-server.js');
    console.log('4. Set working directory: /Users/applestore/Desktop/aws-fiverr/ww/mcp rampup/monday:defy POC');
    console.log('5. NO AUTHENTICATION REQUIRED - MCP protocol handles this');
    console.log('');
    console.log('🔧 Available MCP Tools:');
    console.log('- get_board_items_by_name: Find items by name');
    console.log('- change_item_column_values: Update item columns');
    console.log('- get_board_schema: Get board structure');
    console.log('');
    console.log('🧪 Test Commands:');
    console.log('- "Find item named 1"');
    console.log('- "Update email for item 1 to test@example.com"');
    console.log('- "Get board schema"');

    // Handle stdin/stdout for MCP protocol
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', async (data) => {
      try {
        const lines = data.toString().trim().split('\n');
        for (const line of lines) {
          if (line.trim()) {
            const request = JSON.parse(line);
            const response = await this.handleRequest(request);
            if (response) {
              console.log(JSON.stringify(response));
            }
          }
        }
      } catch (error) {
        console.error('Error processing input:', error);
      }
    });

    process.stdin.resume();
  }
}

// Start the MCP server
const server = new SimpleMCPServer();
server.start();

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down MCP server...');
  process.exit(0);
});

module.exports = SimpleMCPServer; 