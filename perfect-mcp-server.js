const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

console.log('🔓 Perfect MCP Server - NO AUTHENTICATION REQUIRED');

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Perfect MCP Server is running',
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
  
  // Handle initialize
  if (method === 'initialize') {
    console.log('📤 Handling initialize');
    return res.json({
      jsonrpc: '2.0',
      id: id || 0,
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
            name: 'test_tool',
            description: 'A simple test tool',
            inputSchema: {
              type: 'object',
              properties: {
                message: { type: 'string', description: 'Test message' }
              },
              required: ['message']
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
            text: 'Test tool called successfully'
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
  console.log(`🚀 Perfect MCP Server running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log('🔓 NO AUTHENTICATION REQUIRED');
  console.log(`📤 MCP Protocol: POST http://localhost:${PORT}/`);
}); 