const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

console.log('🔓 Final MCP Server - NO AUTHENTICATION REQUIRED');

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Final MCP Server is running',
    auth: 'NO AUTHENTICATION REQUIRED'
  });
});

// Main MCP endpoint
app.post('/', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  
  const { jsonrpc, id, method, params } = req.body;
  
  console.log('📤 MCP Request:', JSON.stringify(req.body, null, 2));
  
  // Basic validation
  if (!jsonrpc || jsonrpc !== '2.0') {
    return res.json({
      jsonrpc: '2.0',
      id: id || 0,
      error: {
        code: -32600,
        message: 'Invalid Request'
      }
    });
  }
  
  // Handle notifications - return minimal JSON response
  if (method === 'notifications/initialized') {
    console.log('📤 Handling notifications/initialized');
    return res.json({
      jsonrpc: '2.0',
      id: id || 0,
      result: {
        success: true
      }
    });
  }
  
  // Handle initialize
  if (method === 'initialize') {
    console.log('📤 Handling initialize');
    return res.json({
      jsonrpc: '2.0',
      id: id || 0,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {},
          resources: {}
        },
        serverInfo: {
          name: 'Monday.com MCP Server',
          version: '1.0.0'
        }
      }
    });
  }
  
  // Handle tools/list
  if (method === 'tools/list') {
    console.log('📤 Handling tools/list');
    return res.json({
      jsonrpc: '2.0',
      id: id || 0,
      result: {
        tools: [
          {
            name: 'get_board_items_by_name',
            description: 'Find items by name in a Monday.com board',
            inputSchema: {
              type: 'object',
              properties: {
                boardId: { type: 'number', description: 'Monday.com board ID' },
                term: { type: 'string', description: 'Item name to search for' }
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
                boardId: { type: 'number', description: 'Monday.com board ID' },
                itemId: { type: 'number', description: 'Item ID to update' },
                columnValues: { type: 'string', description: 'JSON string of column values' }
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
                boardId: { type: 'number', description: 'Monday.com board ID' }
              },
              required: ['boardId']
            }
          }
        ]
      }
    });
  }
  
  // Handle tools/call
  if (method === 'tools/call') {
    console.log('📤 Handling tools/call');
    return handleToolCall(req, res);
  }
  
  // Unknown method
  console.log('❌ Unknown method:', method);
  return res.json({
    jsonrpc: '2.0',
    id: id || 0,
    error: {
      code: -32601,
      message: 'Method not found'
    }
  });
});

async function handleToolCall(req, res) {
  const { id, params } = req.body;
  const { name, arguments: args } = params;
  
  try {
    let result;
    
    switch (name) {
      case 'get_board_items_by_name':
        result = await getBoardItemsByName(args.boardId, args.term);
        break;
      case 'change_item_column_values':
        result = await changeItemColumnValues(args.boardId, args.itemId, args.columnValues);
        break;
      case 'get_board_schema':
        result = await getBoardSchema(args.boardId);
        break;
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
    
    return res.json({
      jsonrpc: '2.0',
      id: id || 0,
      result: {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ],
        isError: false
      }
    });
    
  } catch (error) {
    console.error('❌ Tool call error:', error.message);
    return res.json({
      jsonrpc: '2.0',
      id: id || 0,
      result: {
        content: [
          {
            type: 'text',
            text: `Error: ${error.message}`
          }
        ],
        isError: true
      }
    });
  }
}

async function getBoardItemsByName(boardId, term) {
  const query = `
    query {
      items_by_column_values(board_id: ${boardId}, column_id: "name", column_value: "${term}") {
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
    query
  }, {
    headers: {
      'Authorization': process.env.MONDAY_API_TOKEN,
      'Content-Type': 'application/json'
    }
  });
  
  return response.data.data.items_by_column_values;
}

async function changeItemColumnValues(boardId, itemId, columnValues) {
  const mutation = `
    mutation {
      change_column_value(board_id: ${boardId}, item_id: ${itemId}, column_id: "${process.env.EMAIL_COLUMN_ID}", value: ${columnValues}) {
        id
        name
      }
    }
  `;
  
  const response = await axios.post('https://api.monday.com/v2', {
    query: mutation
  }, {
    headers: {
      'Authorization': process.env.MONDAY_API_TOKEN,
      'Content-Type': 'application/json'
    }
  });
  
  return response.data.data.change_column_value;
}

async function getBoardSchema(boardId) {
  const query = `
    query {
      boards(ids: ${boardId}) {
        columns {
          id
          title
          type
        }
      }
    }
  `;
  
  const response = await axios.post('https://api.monday.com/v2', {
    query
  }, {
    headers: {
      'Authorization': process.env.MONDAY_API_TOKEN,
      'Content-Type': 'application/json'
    }
  });
  
  return response.data.data.boards[0];
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Final MCP Server running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log('🔓 NO AUTHENTICATION REQUIRED');
  console.log(`📤 MCP Protocol: POST http://localhost:${PORT}/`);
}); 