const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

console.log('🔓 Dify-Simple-API Server - NO AUTHENTICATION REQUIRED');

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Dify-Simple-API Server is running',
    auth: 'NO AUTHENTICATION REQUIRED'
  });
});

// Get board items by name
app.post('/api/get-board-items', (req, res) => {
  const { boardId, term } = req.body;
  
  console.log('📤 Get board items request:', { boardId, term });
  
  // Mock response for now
  res.json({
    success: true,
    data: [
      {
        id: 123,
        name: term || 'Test Item',
        boardId: boardId
      }
    ]
  });
});

// Update item column values
app.post('/api/update-item', (req, res) => {
  const { boardId, itemId, columnValues } = req.body;
  
  console.log('📤 Update item request:', { boardId, itemId, columnValues });
  
  // Mock response for now
  res.json({
    success: true,
    message: 'Item updated successfully',
    data: {
      boardId,
      itemId,
      columnValues
    }
  });
});

// Get board schema
app.get('/api/board-schema/:boardId', (req, res) => {
  const { boardId } = req.params;
  
  console.log('📤 Get board schema request:', { boardId });
  
  // Mock response for now
  res.json({
    success: true,
    data: {
      boardId: parseInt(boardId),
      columns: [
        {
          id: 'email',
          title: 'Email',
          type: 'email'
        },
        {
          id: 'name',
          title: 'Name',
          type: 'text'
        }
      ]
    }
  });
});

// MCP compatibility endpoint (simplified)
app.post('/mcp', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  
  const { jsonrpc, id, method, params } = req.body;
  
  console.log('📤 MCP Request:', JSON.stringify(req.body, null, 2));
  
  try {
    // Handle initialize
    if (method === 'initialize') {
      const response = {
        jsonrpc: '2.0',
        id: id || 0,
        result: {
          protocolVersion: params?.protocolVersion || '2024-11-05',
          capabilities: { tools: {} },
          serverInfo: {
            name: 'Monday.com API Server',
            version: '1.0.0'
          }
        }
      };
      return res.json(response);
    }
    
    // Handle notifications/initialized
    if (method === 'notifications/initialized') {
      const response = {
        jsonrpc: '2.0',
        id: id || 0,
        result: {}
      };
      return res.json(response);
    }
    
    // Handle tools/list
    if (method === 'tools/list') {
      const response = {
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
                  boardId: { type: 'number' },
                  term: { type: 'string' }
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
                  boardId: { type: 'number' },
                  itemId: { type: 'number' },
                  columnValues: { type: 'string' }
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
                  boardId: { type: 'number' }
                },
                required: ['boardId']
              }
            }
          ]
        }
      };
      return res.json(response);
    }
    
    // Handle tools/call
    if (method === 'tools/call') {
      const { name, arguments: args } = params || {};
      
      console.log('📤 Tool call:', { name, args });
      
      const response = {
        jsonrpc: '2.0',
        id: id || 0,
        result: {
          content: [
            {
              type: 'text',
              text: `Successfully called ${name} with arguments: ${JSON.stringify(args)}`
            }
          ]
        }
      };
      return res.json(response);
    }
    
    // Unknown method
    const errorResponse = {
      jsonrpc: '2.0',
      id: id || 0,
      error: {
        code: -32601,
        message: 'Method not found'
      }
    };
    return res.json(errorResponse);
    
  } catch (error) {
    console.error('❌ Error handling request:', error);
    const errorResponse = {
      jsonrpc: '2.0',
      id: id || 0,
      error: {
        code: -32603,
        message: 'Internal error'
      }
    };
    return res.json(errorResponse);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Dify-Simple-API Server running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`📤 API endpoints:`);
  console.log(`   POST /api/get-board-items`);
  console.log(`   POST /api/update-item`);
  console.log(`   GET /api/board-schema/:boardId`);
  console.log(`   POST /mcp (MCP compatibility)`);
  console.log('🔓 NO AUTHENTICATION REQUIRED');
}); 