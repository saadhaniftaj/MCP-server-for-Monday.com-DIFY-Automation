const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

console.log('🔓 Complete MCP Server - NO AUTHENTICATION REQUIRED');

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Complete MCP Server is running',
    auth: 'NO AUTHENTICATION REQUIRED'
  });
});

// Main MCP endpoint
app.post('/', (req, res) => {
  // Set proper content type for all responses
  res.setHeader('Content-Type', 'application/json');
  console.log('📤 MCP Request:', JSON.stringify(req.body, null, 2));
  
  const { jsonrpc, id, method, params } = req.body;
  
  // Basic validation
  if (!jsonrpc || jsonrpc !== '2.0') {
    return res.json({
      jsonrpc: '2.0',
      id: id || null,
      error: {
        code: -32600,
        message: 'Invalid Request: jsonrpc must be "2.0"'
      }
    });
  }
  
  // Handle notifications (no response needed)
  if (method === 'notifications/initialized') {
    console.log('📤 Handling notifications/initialized - no response needed');
    return res.json({
      jsonrpc: '2.0',
      id: 0,
      result: {}
    });
  }
  
  // Handle requests that need responses
  switch (method) {
    case 'initialize':
      res.json({
        jsonrpc: '2.0',
        id: id,
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
      break;
      
    case 'tools/list':
      res.json({
        jsonrpc: '2.0',
        id: id,
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
      break;
      
    case 'tools/call':
      handleToolCall(req, res);
      break;
      
    default:
      res.json({
        jsonrpc: '2.0',
        id: id,
        error: {
          code: -32601,
          message: `Method not found: ${method}`
        }
      });
  }
});

async function handleToolCall(req, res) {
  try {
    const { id, params } = req.body;
    const { name, arguments: args } = params || {};
    
    if (!name) {
      return res.json({
        jsonrpc: '2.0',
        id: id,
        error: {
          code: -32602,
          message: 'Invalid params: tool name is required'
        }
      });
    }
    
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
        return res.json({
          jsonrpc: '2.0',
          id: id,
          error: {
            code: -32601,
            message: `Method not found: ${name}`
          }
        });
    }
    
    res.json({
      jsonrpc: '2.0',
      id: id,
      result: {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ]
      }
    });
  } catch (error) {
    console.error('❌ Tools/call error:', error);
    res.json({
      jsonrpc: '2.0',
      id: req.body.id,
      error: {
        code: -32603,
        message: error.message
      }
    });
  }
}

async function getBoardItemsByName(boardId, term) {
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

async function changeItemColumnValues(boardId, itemId, columnValues) {
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

async function getBoardSchema(boardId) {
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

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Complete MCP Server running on port ${port}`);
  console.log(`📋 Health check: http://localhost:${port}/health`);
  console.log(`🔓 NO AUTHENTICATION REQUIRED`);
  console.log(`📤 MCP Protocol: POST http://localhost:${port}/`);
}); 