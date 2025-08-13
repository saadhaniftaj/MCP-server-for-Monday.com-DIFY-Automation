const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enhanced CORS for Dify.ai compatibility
app.use(cors({
  origin: ['https://cloud.dify.ai', 'https://*.dify.ai', 'https://*.dify.dev'],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '1mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-cache');
  res.json({
    status: "ok",
    message: "Dify-Nuclear Server is running",
    version: "1.0.0",
    protocol_version: "2025-03-26",
    note: "Nuclear option - ignores notifications completely"
  });
});

// Main MCP endpoint - Nuclear option
app.post('/', (req, res) => {
  // Enhanced headers for Dify.ai
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  const { jsonrpc, id, method, params } = req.body;
  
  // Validate JSON-RPC 2.0 format
  if (jsonrpc !== "2.0") {
    return res.json({
      jsonrpc: "2.0",
      id: id,
      error: {
        code: -32600,
        message: "Invalid Request: jsonrpc must be '2.0'"
      }
    });
  }
  
  // Handle different methods - Nuclear option
  switch (method) {
    case 'initialize':
      return res.json({
        jsonrpc: "2.0",
        id: id,
        result: {
          protocolVersion: "2025-03-26",
          capabilities: {
            tools: {},
            sampling: {},
            roots: {
              listChanged: true
            }
          },
          serverInfo: {
            name: "Monday.com MCP Server",
            version: "1.0.0"
          }
        }
      });
      
    case 'notifications/initialized':
      // 🚨 NUCLEAR OPTION: Completely ignore notifications - NO RESPONSE AT ALL
      console.log('🚨 NUCLEAR: Ignoring notifications/initialized request');
      return; // NO RESPONSE - this should prevent ALL cleanup errors
      
    case 'tools/list':
      return res.json({
        jsonrpc: "2.0",
        id: id,
        result: {
          tools: [
            {
              name: "monday_email_updater",
              description: "Update email in Monday.com",
              inputSchema: {
                type: "object",
                properties: {
                  itemName: { type: "string" },
                  email: { type: "string", format: "email" }
                },
                required: ["itemName", "email"]
              }
            },
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
          ]
        }
      });
      
    case 'tools/call':
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
      
      // Mock tool implementations - immediate responses
      let toolResult;
      switch (name) {
        case 'monday_email_updater':
          const { itemName, email } = toolArgs || {};
          toolResult = {
            status: "success",
            message: `Email updated for item "${itemName}" to ${email}`,
            itemName: itemName,
            email: email,
            timestamp: new Date().toISOString()
          };
          break;
          
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
      
      return res.json({
        jsonrpc: "2.0",
        id: id,
        result: toolResult
      });
      
    default:
      return res.json({
        jsonrpc: "2.0",
        id: id,
        error: {
          code: -32601,
          message: `Method not found: ${method}`
        }
      });
  }
});

// Error handler for 500 errors
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    jsonrpc: "2.0",
    id: 0,
    error: {
      code: -32603,
      message: "Internal error"
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Dify-Nuclear Server running on port ${PORT}`);
  console.log(`⚡ NUCLEAR: No response for notifications`);
  console.log(`🔧 Protocol version: 2025-03-26`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 CORS enabled for Dify.ai domains`);
  console.log(`📝 Note: This completely ignores notifications`);
}); 