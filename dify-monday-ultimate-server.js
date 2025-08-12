const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

console.log('🔓 Dify-Monday-Ultimate Server - NO AUTHENTICATION REQUIRED');

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Dify-Monday-Ultimate Server is running',
    auth: 'NO AUTHENTICATION REQUIRED'
  });
});

// Main MCP endpoint
app.post('/', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  
  const { jsonrpc, id, method, params } = req.body;
  
  console.log('📤 MCP Request:', JSON.stringify(req.body, null, 2));
  
  // Validate request
  if (!jsonrpc || jsonrpc !== '2.0') {
    return res.json({
      jsonrpc: '2.0',
      id: id || null,
      error: {
        code: -32600,
        message: 'Invalid Request'
      }
    });
  }
  
  // Handle initialize
  if (method === 'initialize') {
    console.log('📤 Handling initialize');
    const response = {
      jsonrpc: '2.0',
      id: id || 0,
      result: {
        protocolVersion: params?.protocolVersion || '2024-11-05',
        capabilities: {
          tools: {}
        },
        serverInfo: {
          name: 'Monday.com MCP Server',
          version: '1.0.0'
        }
      }
    };
    console.log('📤 Sending response:', JSON.stringify(response, null, 2));
    return res.json(response);
  }
  
  // Handle notifications/initialized
  if (method === 'notifications/initialized') {
    console.log('📤 Handling notifications/initialized');
    const response = {
      jsonrpc: '2.0',
      id: id || 0,
      result: {}
    };
    console.log('📤 Sending response:', JSON.stringify(response, null, 2));
    return res.json(response);
  }
  
  // Handle tools/list
  if (method === 'tools/list') {
    console.log('📤 Handling tools/list');
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
    console.log('📤 Sending response:', JSON.stringify(response, null, 2));
    return res.json(response);
  }
  
  // Handle tools/call
  if (method === 'tools/call') {
    console.log('📤 Handling tools/call');
    const response = {
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
    };
    console.log('📤 Sending response:', JSON.stringify(response, null, 2));
    return res.json(response);
  }
  
  // Unknown method
  console.log('❌ Unknown method:', method);
  const errorResponse = {
    jsonrpc: '2.0',
    id: id || 0,
    error: {
      code: -32601,
      message: 'Method not found'
    }
  };
  console.log('📤 Sending error response:', JSON.stringify(errorResponse, null, 2));
  return res.json(errorResponse);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Dify-Monday-Ultimate Server running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log('🔓 NO AUTHENTICATION REQUIRED');
  console.log(`📤 MCP Protocol: POST http://localhost:${PORT}/`);
}); 