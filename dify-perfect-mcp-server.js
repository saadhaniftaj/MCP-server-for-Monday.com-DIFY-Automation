const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

console.log('🔓 Dify-Perfect MCP Server - NO AUTHENTICATION REQUIRED');

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Dify-Perfect MCP Server is running',
    auth: 'NO AUTHENTICATION REQUIRED'
  });
});

// Main MCP endpoint
app.post('/', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  
  const { jsonrpc, id, method, params } = req.body;
  
  console.log('📤 MCP Request:', JSON.stringify(req.body, null, 2));
  
  // Always ensure we have a valid response
  try {
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
          tools: []
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
    console.log('📤 Sending error response:', JSON.stringify(errorResponse, null, 2));
    return res.json(errorResponse);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Dify-Perfect MCP Server running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log('🔓 NO AUTHENTICATION REQUIRED');
  console.log(`📤 MCP Protocol: POST http://localhost:${PORT}/`);
}); 