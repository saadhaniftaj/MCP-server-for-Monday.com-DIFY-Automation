const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

console.log('🔓 Dify-Compatible Monday.com MCP Server - NO AUTHENTICATION REQUIRED');

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Dify-Compatible Monday.com MCP Server is running',
    auth: 'NO AUTHENTICATION REQUIRED'
  });
});

// Main MCP endpoint
app.post('/', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  
  const { jsonrpc, id, method } = req.body;
  
  console.log('📤 MCP Request:', JSON.stringify(req.body, null, 2));
  
  // Handle initialize
  if (method === 'initialize') {
    console.log('📤 Handling initialize');
    return res.json({
      jsonrpc: '2.0',
      id: id || 0,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        serverInfo: {
          name: 'Monday.com MCP Server',
          version: '1.0.0'
        }
      }
    });
  }
  
  // Handle notifications/initialized
  if (method === 'notifications/initialized') {
    console.log('📤 Handling notifications/initialized');
    return res.json({
      jsonrpc: '2.0',
      id: id || 0,
      result: {}
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
    return res.json({
      jsonrpc: '2.0',
      id: id || 0,
      result: {
        content: [
          {
            type: 'text',
            text: 'Success'
          }
        ]
      }
    });
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Dify-Compatible Monday.com MCP Server running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log('🔓 NO AUTHENTICATION REQUIRED');
  console.log(`📤 MCP Protocol: POST http://localhost:${PORT}/`);
}); 