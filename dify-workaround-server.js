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
    message: "Dify-Workaround Server is running",
    version: "1.0.0",
    protocol_version: "2025-03-26",
    note: "Direct HTTP endpoints - bypasses Dify.ai MCP issues"
  });
});

// Direct HTTP endpoints for Monday.com operations
app.post('/api/monday/update-email', (req, res) => {
  const { itemName, email } = req.body;
  
  if (!itemName || !email) {
    return res.status(400).json({
      error: "Missing required fields: itemName and email"
    });
  }
  
  // Mock Monday.com email update
  const result = {
    status: "success",
    message: `Email updated for item "${itemName}" to ${email}`,
    itemName: itemName,
    email: email,
    timestamp: new Date().toISOString()
  };
  
  res.json(result);
});

app.post('/api/monday/search-items', (req, res) => {
  const { boardId, term } = req.body;
  
  if (!boardId || !term) {
    return res.status(400).json({
      error: "Missing required fields: boardId and term"
    });
  }
  
  // Mock Monday.com item search
  const result = {
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
  
  res.json(result);
});

app.post('/api/monday/update-column', (req, res) => {
  const { boardId, itemId, columnValues } = req.body;
  
  if (!boardId || !itemId || !columnValues) {
    return res.status(400).json({
      error: "Missing required fields: boardId, itemId, and columnValues"
    });
  }
  
  // Mock Monday.com column update
  const result = {
    itemId: itemId,
    status: "updated",
    message: "Column values updated successfully",
    updatedValues: JSON.parse(columnValues || '{}')
  };
  
  res.json(result);
});

app.get('/api/monday/board-schema/:boardId', (req, res) => {
  const { boardId } = req.params;
  
  if (!boardId) {
    return res.status(400).json({
      error: "Missing boardId parameter"
    });
  }
  
  // Mock Monday.com board schema
  const result = {
    boardId: boardId,
    columns: [
      { id: "status", title: "Status", type: "status" },
      { id: "text", title: "Text", type: "text" },
      { id: "date", title: "Date", type: "date" }
    ]
  };
  
  res.json(result);
});

// MCP endpoint - Minimal for compatibility
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
  
  // Handle different methods - Minimal MCP
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
      // HTTP 204 No Content - prevents cleanup errors
      return res.status(204).send();
      
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
  console.log(`🚀 Dify-Workaround Server running on port ${PORT}`);
  console.log(`⚡ WORKAROUND: Direct HTTP endpoints + MCP`);
  console.log(`🔧 Protocol version: 2025-03-26`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 CORS enabled for Dify.ai domains`);
  console.log(`📝 Note: Bypasses Dify.ai's internal API issues`);
  console.log(`🔗 Direct endpoints:`);
  console.log(`   POST /api/monday/update-email`);
  console.log(`   POST /api/monday/search-items`);
  console.log(`   POST /api/monday/update-column`);
  console.log(`   GET /api/monday/board-schema/:boardId`);
}); 