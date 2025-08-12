const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Debug logging middleware
app.use((req, res, next) => {
  console.log('🔍 === INCOMING REQUEST ===');
  console.log('📥 Method:', req.method);
  console.log('📥 URL:', req.url);
  console.log('📥 Headers:', JSON.stringify(req.headers, null, 2));
  console.log('📥 Body:', JSON.stringify(req.body, null, 2));
  console.log('🔍 ========================');
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: "ok",
    message: "Dify-Debug Server is running",
    auth: "NO AUTHENTICATION REQUIRED"
  });
});

// Main MCP endpoint
app.post('/', async (req, res) => {
  try {
    const { jsonrpc, id, method, params } = req.body;
    
    console.log('🔍 === PROCESSING REQUEST ===');
    console.log('📥 jsonrpc:', jsonrpc);
    console.log('📥 id:', id);
    console.log('📥 method:', method);
    console.log('📥 params:', JSON.stringify(params, null, 2));
    console.log('🔍 =========================');
    
    // Validate JSON-RPC 2.0 format
    if (jsonrpc !== "2.0") {
      console.log('❌ Invalid JSON-RPC version');
      return res.status(400).json({
        jsonrpc: "2.0",
        id: id,
        error: {
          code: -32600,
          message: "Invalid Request: jsonrpc must be '2.0'"
        }
      });
    }
    
    // Handle different methods
    switch (method) {
      case 'initialize':
        console.log('🔧 Handling initialize');
        const initResult = {
          protocolVersion: "2025-03-26",
          capabilities: {
            tools: {}
          },
          serverInfo: {
            name: "Monday.com MCP Server",
            version: "1.0.0"
          }
        };
        console.log('📤 Sending initialize response:', JSON.stringify(initResult, null, 2));
        return res.json({
          jsonrpc: "2.0",
          id: id,
          result: initResult
        });
        
      case 'notifications/initialized':
        console.log('📤 Handling notifications/initialized');
        console.log('📤 NOT SENDING ANY RESPONSE - this should be a one-way notification');
        // Don't send any response for notifications
        return res.status(204).send();
        
      case 'tools/list':
        console.log('🛠️ Handling tools/list');
        const tools = [
          {
            name: "get_board_items_by_name",
            description: "Find items by name in a Monday.com board",
            inputSchema: {
              type: "object",
              properties: {
                boardId: { type: "number" },
                term: { type: "string" }
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
                boardId: { type: "number" },
                itemId: { type: "number" },
                columnValues: { type: "string" }
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
                boardId: { type: "number" }
              },
              required: ["boardId"]
            }
          }
        ];
        console.log('📤 Sending tools/list response');
        return res.json({
          jsonrpc: "2.0",
          id: id,
          result: { tools }
        });
        
      case 'tools/call':
        console.log('🔧 Handling tools/call');
        const { name, arguments: toolArgs } = params || {};
        
        if (!name) {
          return res.json({
            jsonrpc: "2.0",
            id: id,
            error: {
              code: -32602,
              message: "Invalid params: tool name is required"
            }
          });
        }
        
        // Mock tool implementations
        let toolResult;
        switch (name) {
          case 'get_board_items_by_name':
            const { boardId, term } = toolArgs || {};
            toolResult = {
              items: [
                {
                  id: 123,
                  name: `Mock item matching "${term}"`,
                  boardId: boardId,
                  status: "active"
                }
              ],
              total: 1
            };
            break;
            
          case 'change_item_column_values':
            const { itemId, columnValues } = toolArgs || {};
            toolResult = {
              itemId: itemId,
              status: "updated",
              message: "Column values updated successfully",
              updatedValues: JSON.parse(columnValues || '{}')
            };
            break;
            
          case 'get_board_schema':
            const { boardId: schemaBoardId } = toolArgs || {};
            toolResult = {
              boardId: schemaBoardId,
              columns: [
                { id: "status", title: "Status", type: "status" },
                { id: "text", title: "Text", type: "text" },
                { id: "date", title: "Date", type: "date" }
              ]
            };
            break;
            
          default:
            return res.json({
              jsonrpc: "2.0",
              id: id,
              error: {
                code: -32601,
                message: `Method not found: ${name}`
              }
            });
        }
        
        console.log('📤 Sending tools/call response:', JSON.stringify(toolResult, null, 2));
        return res.json({
          jsonrpc: "2.0",
          id: id,
          result: toolResult
        });
        
      default:
        console.log('❌ Unknown method:', method);
        return res.json({
          jsonrpc: "2.0",
          id: id,
          error: {
            code: -32601,
            message: `Method not found: ${method}`
          }
        });
    }
    
  } catch (error) {
    console.error('❌ Server error:', error);
    return res.status(500).json({
      jsonrpc: "2.0",
      id: req.body?.id,
      error: {
        code: -32603,
        message: "Internal error: " + error.message
      }
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Dify-Debug Server running on port ${PORT}`);
  console.log(`🔍 Debug mode enabled - all requests will be logged`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
}); 