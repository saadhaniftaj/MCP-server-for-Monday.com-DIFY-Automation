const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

console.log('🔓 Dify-Minimal-Valid Server - NO AUTHENTICATION REQUIRED');

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Dify-Minimal-Valid Server is running',
    auth: 'NO AUTHENTICATION REQUIRED'
  });
});

// Main MCP endpoint
app.post('/', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  
  const { jsonrpc, id, method, params } = req.body;
  
  console.log('📤 MCP Request:', JSON.stringify(req.body, null, 2));
  
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
  
  // Handle notifications/initialized - minimal valid JSON
  if (method === 'notifications/initialized') {
    console.log('📤 Handling notifications/initialized - sending minimal valid JSON');
    const response = {
      jsonrpc: '2.0',
      id: id || 0,
      result: {
        success: true
      }
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
    const { name, arguments: args } = params || {};
    
    console.log('📤 Tool call:', { name, args });
    
    let resultText = '';
    
    if (name === 'get_board_items_by_name') {
      resultText = `Found items in board ${args.boardId} matching "${args.term}": Sample Item 1, Sample Item 2`;
    } else if (name === 'change_item_column_values') {
      resultText = `Updated item ${args.itemId} in board ${args.boardId} with values: ${args.columnValues}`;
    } else if (name === 'get_board_schema') {
      resultText = `Retrieved schema for board ${args.boardId}: Name (text), Status (status), Date (date)`;
    } else {
      resultText = `Successfully called ${name} with arguments: ${JSON.stringify(args)}`;
    }
    
    const response = {
      jsonrpc: '2.0',
      id: id || 0,
      result: {
        content: [
          {
            type: 'text',
            text: resultText
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
  console.log(`🚀 Dify-Minimal-Valid Server running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log('🔓 NO AUTHENTICATION REQUIRED');
  console.log(`📤 MCP Protocol: POST http://localhost:${PORT}/`);
}); 