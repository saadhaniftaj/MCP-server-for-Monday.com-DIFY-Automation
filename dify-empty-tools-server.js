const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

console.log('🔓 Dify-Empty-Tools Server - NO AUTHENTICATION REQUIRED');

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Dify-Empty-Tools Server is running',
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
    return res.json({
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
  
  // Handle tools/list - return empty array
  if (method === 'tools/list') {
    console.log('📤 Handling tools/list - returning empty array');
    return res.json({
      jsonrpc: '2.0',
      id: id || 0,
      result: {
        tools: []
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
  console.log(`🚀 Dify-Empty-Tools Server running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log('🔓 NO AUTHENTICATION REQUIRED');
  console.log(`📤 MCP Protocol: POST http://localhost:${PORT}/`);
}); 