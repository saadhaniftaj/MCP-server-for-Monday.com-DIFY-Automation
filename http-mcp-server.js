const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

class HTTPMCPServer {
  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
    console.log('🔓 HTTP MCP Server - NO AUTHENTICATION REQUIRED');
  }

  setupRoutes() {
    // MCP Protocol endpoints
    this.app.post('/mcp/initialize', (req, res) => {
      console.log('📤 MCP Initialize request:', req.body);
      res.json({
        jsonrpc: "2.0",
        id: req.body.id,
        result: {
          protocolVersion: "2024-11-05",
          capabilities: {
            tools: {}
          },
          serverInfo: {
            name: "Monday.com MCP Server",
            version: "1.0.0"
          }
        }
      });
    });

    this.app.post('/mcp/tools/list', (req, res) => {
      console.log('📤 MCP Tools/List request:', req.body);
      res.json({
        jsonrpc: "2.0",
        id: req.body.id,
        result: {
          tools: [
            {
              name: "get_board_items_by_name",
              description: "Find items by name in a Monday.com board",
              inputSchema: {
                type: "object",
                properties: {
                  boardId: {
                    type: "number",
                    description: "Monday.com board ID"
                  },
                  term: {
                    type: "string",
                    description: "Item name to search for"
                  }
                },
                required: ["boardId", "term"]
              }
            },
            {
              name: "change_item_column_values",
              description: "Update column values for an item",
              inputSchema: {
                type: "object",
                properties: {
                  boardId: {
                    type: "number",
                    description: "Monday.com board ID"
                  },
                  itemId: {
                    type: "number",
                    description: "Item ID to update"
                  },
                  columnValues: {
                    type: "string",
                    description: "JSON string of column values"
                  }
                },
                required: ["boardId", "itemId", "columnValues"]
              }
            },
            {
              name: "get_board_schema",
              description: "Get board schema including columns",
              inputSchema: {
                type: "object",
                properties: {
                  boardId: {
                    type: "number",
                    description: "Monday.com board ID"
                  }
                },
                required: ["boardId"]
              }
            }
          ]
        }
      });
    });

    this.app.post('/mcp/tools/call', async (req, res) => {
      console.log('📤 MCP Tools/Call request:', req.body);
      
      try {
        const { name, arguments: args } = req.body.params;
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
            throw new Error(`Unknown tool: ${name}`);
        }

        res.json({
          jsonrpc: "2.0",
          id: req.body.id,
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2)
              }
            ]
          }
        });
      } catch (error) {
        console.error('❌ MCP Tools/Call error:', error);
        res.json({
          jsonrpc: "2.0",
          id: req.body.id,
          error: {
            code: -32603,
            message: error.message
          }
        });
      }
    });

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        message: 'HTTP MCP Server is running',
        auth: 'NO AUTHENTICATION REQUIRED'
      });
    });

    // Root endpoint for MCP protocol
    this.app.post('/', async (req, res) => {
      console.log('📤 MCP Root request:', req.body);
      
      const { method, id, params } = req.body;
      
      switch (method) {
        case 'initialize':
          res.json({
            jsonrpc: "2.0",
            id: id,
            result: {
              protocolVersion: "2024-11-05",
              capabilities: { 
                tools: {},
                resources: {}
              },
              serverInfo: {
                name: "Monday.com MCP Server",
                version: "1.0.0"
              }
            }
          });
          break;
          
        case 'tools/list':
          res.json({
            jsonrpc: "2.0",
            id: id,
            result: {
              tools: [
                {
                  name: "get_board_items_by_name",
                  description: "Find items by name in a Monday.com board",
                  inputSchema: {
                    type: "object",
                    properties: {
                      boardId: { type: "number", description: "Monday.com board ID" },
                      term: { type: "string", description: "Item name to search for" }
                    },
                    required: ["boardId", "term"]
                  }
                },
                {
                  name: "change_item_column_values",
                  description: "Update column values for an item",
                  inputSchema: {
                    type: "object",
                    properties: {
                      boardId: { type: "number", description: "Monday.com board ID" },
                      itemId: { type: "number", description: "Item ID to update" },
                      columnValues: { type: "string", description: "JSON string of column values" }
                    },
                    required: ["boardId", "itemId", "columnValues"]
                  }
                },
                {
                  name: "get_board_schema",
                  description: "Get board schema including columns",
                  inputSchema: {
                    type: "object",
                    properties: {
                      boardId: { type: "number", description: "Monday.com board ID" }
                    },
                    required: ["boardId"]
                  }
                }
              ]
            }
          });
          break;
          
        case 'tools/call':
          try {
            const { name, arguments: args } = params;
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
                throw new Error(`Unknown tool: ${name}`);
            }

            res.json({
              jsonrpc: "2.0",
              id: id,
              result: {
                content: [
                  {
                    type: "text",
                    text: JSON.stringify(result, null, 2)
                  }
                ],
                isError: false
              }
            });
          } catch (error) {
            console.error('❌ MCP Tools/Call error:', error);
            res.json({
              jsonrpc: "2.0",
              id: id,
              error: {
                code: -32603,
                message: error.message
              }
            });
          }
          break;
          
        default:
          res.json({
            jsonrpc: "2.0",
            id: id,
            error: {
              code: -32601,
              message: `Method not found: ${method}`
            }
          });
      }
    });
  }

  async getBoardItemsByName(boardId, term) {
    const query = `
      query getBoardItemsByName($boardId: [ID!], $term: String!) {
        items_by_column_values(board_id: $boardId, column_id: "name", column_value: $term) {
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
    `;

    const response = await axios.post('https://api.monday.com/v2', {
      query,
      variables: { boardId: [boardId.toString()], term }
    }, {
      headers: {
        'Authorization': process.env.MONDAY_API_TOKEN,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
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
      variables: { 
        boardId: boardId.toString(), 
        itemId: itemId.toString(), 
        columnValues: JSON.parse(columnValues)
      }
    }, {
      headers: {
        'Authorization': process.env.MONDAY_API_TOKEN,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  }

  async getBoardSchema(boardId) {
    const query = `
      query getBoardSchema($boardId: [ID!]) {
        boards(ids: $boardId) {
          id
          name
          columns {
            id
            title
            type
          }
        }
      }
    `;

    const response = await axios.post('https://api.monday.com/v2', {
      query,
      variables: { boardId: [boardId.toString()] }
    }, {
      headers: {
        'Authorization': process.env.MONDAY_API_TOKEN,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  }

  start(port = process.env.PORT || 3000) {
    this.app.listen(port, () => {
      console.log(`🚀 HTTP MCP Server running on port ${port}`);
      console.log(`📋 Health check: http://localhost:${port}/health`);
      console.log(`🔓 NO AUTHENTICATION REQUIRED`);
      console.log(`📤 MCP Protocol: POST http://localhost:${port}/`);
    });
  }
}

// Start the server
const server = new HTTPMCPServer();
server.start(); 