const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MCP Protocol Version
const MCP_PROTOCOL_VERSION = "2025-03-26";

// Helper function to create proper JSON-RPC 2.0 responses
function createResponse(id, result = null, error = null) {
  const response = {
    jsonrpc: "2.0",
    id: id
  };
  
  if (error) {
    response.error = {
      code: error.code || -32603,
      message: error.message || "Internal error"
    };
  } else if (result !== null) {
    response.result = result;
  }
  
  return response;
}

// Helper function to create proper JSON-RPC 2.0 notifications
function createNotification(method, params = null) {
  const notification = {
    jsonrpc: "2.0",
    method: method
  };
  
  if (params !== null) {
    notification.params = params;
  }
  
  return notification;
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: "ok",
    message: "Dify-Proper-MCP Server is running",
    auth: "NO AUTHENTICATION REQUIRED",
    protocol: MCP_PROTOCOL_VERSION
  });
});

// Main MCP endpoint
app.post('/', async (req, res) => {
  try {
    const { jsonrpc, id, method, params } = req.body;
    
    console.log('📥 Received request:', JSON.stringify(req.body, null, 2));
    
    // Validate JSON-RPC 2.0 format
    if (jsonrpc !== "2.0") {
      console.log('❌ Invalid JSON-RPC version');
      return res.status(400).json(createResponse(id, null, {
        code: -32600,
        message: "Invalid Request: jsonrpc must be '2.0'"
      }));
    }
    
    // Handle different methods
    switch (method) {
      case 'initialize':
        console.log('🔧 Handling initialize');
        const initResult = {
          protocolVersion: MCP_PROTOCOL_VERSION,
          capabilities: {
            tools: {}
          },
          serverInfo: {
            name: "Monday.com MCP Server",
            version: "1.0.0"
          }
        };
        console.log('📤 Sending initialize response:', JSON.stringify(createResponse(id, initResult), null, 2));
        return res.json(createResponse(id, initResult));
        
      case 'notifications/initialized':
        console.log('📤 Handling notifications/initialized - sending true notification');
        // For true notifications, we should not send an id field
        // This makes it a one-way notification, not a request-response
        const notificationResponse = {
          jsonrpc: "2.0",
          method: "notifications/initialized",
          params: {
            status: "received"
          }
        };
        console.log('📤 Sending notification:', JSON.stringify(notificationResponse, null, 2));
        return res.json(notificationResponse);
        
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
        const toolsResult = { tools };
        console.log('📤 Sending tools/list response:', JSON.stringify(createResponse(id, toolsResult), null, 2));
        return res.json(createResponse(id, toolsResult));
        
      case 'tools/call':
        console.log('🔧 Handling tools/call');
        const { name, arguments: toolArgs } = params || {};
        
        if (!name) {
          return res.json(createResponse(id, null, {
            code: -32602,
            message: "Invalid params: tool name is required"
          }));
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
            return res.json(createResponse(id, null, {
              code: -32601,
              message: `Method not found: ${name}`
            }));
        }
        
        console.log('📤 Sending tools/call response:', JSON.stringify(createResponse(id, toolResult), null, 2));
        return res.json(createResponse(id, toolResult));
        
      default:
        console.log('❌ Unknown method:', method);
        return res.json(createResponse(id, null, {
          code: -32601,
          message: `Method not found: ${method}`
        }));
    }
    
  } catch (error) {
    console.error('❌ Server error:', error);
    return res.status(500).json(createResponse(req.body?.id, null, {
      code: -32603,
      message: "Internal error: " + error.message
    }));
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Unhandled error:', error);
  res.status(500).json(createResponse(null, null, {
    code: -32603,
    message: "Internal server error"
  }));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Dify-Proper-MCP Server running on port ${PORT}`);
  console.log(`📋 Protocol version: ${MCP_PROTOCOL_VERSION}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
}); 