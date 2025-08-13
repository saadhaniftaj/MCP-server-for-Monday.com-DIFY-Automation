const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware - optimized for Dify.ai compatibility
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: "ok",
    message: "Dify-Compatible Server is running",
    auth: "NO AUTHENTICATION REQUIRED"
  });
});

// Main MCP endpoint - Dify.ai compatible
app.post('/', (req, res) => {
  // Set headers immediately for speed
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
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
  
  // Handle different methods - Dify.ai compatible
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
      // Dify.ai expects a simple acknowledgment
      return res.json({
        jsonrpc: "2.0",
        id: null,
        result: null
      });
      
    case 'tools/list':
      return res.json({
        jsonrpc: "2.0",
        id: id,
        result: {
          tools: [
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Dify-Compatible Server running on port ${PORT}`);
  console.log(`⚡ Dify.ai compatible - simple acknowledgment for notifications`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
}); 