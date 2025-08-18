const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Monday.com API configuration
const MONDAY_API_TOKEN = process.env.MONDAY_API_TOKEN;
const MONDAY_API_URL = 'https://api.monday.com/v2';
const BOARD_ID = 2056518483;

// CORS configuration
app.use(cors({
  origin: ['https://cloud.dify.ai', 'https://*.dify.ai', 'https://*.dify.dev', 'http://localhost:3000', 'http://localhost:5678', 'http://localhost:3001', 'http://127.0.0.1:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '1mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: "ok",
    message: "Production Monday.com MCP Server - REAL INTEGRATION",
    version: "5.0.0",
    protocol_version: "2025-03-26",
    monday_connected: !!MONDAY_API_TOKEN,
    board_id: BOARD_ID,
    note: "Real Monday.com API integration - no mock data!"
  });
});

// MCP endpoint
app.post('/', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  const { method, id, params } = req.body;
  console.log(`🔧 MCP Request: ${method}`);
  
  if (method === 'notifications/initialized') {
    res.status(204).send();
    return;
  }
  
  if (method === 'tools/list') {
    const response = {
      jsonrpc: "2.0",
      id: id,
      result: {
        tools: [
          {
            name: "monday_email_updater",
            description: "Update email for a specific item in Monday.com board",
            inputSchema: {
              type: "object",
              properties: {
                itemName: { type: "string", description: "Item name (e.g., '1', '2', '3', 'final')" },
                email: { type: "string", format: "email", description: "Email address to set" },
                boardId: { type: "number", description: "Board ID (default: 2056518483)" },
                itemId: { type: "number", description: "Item ID (optional)" }
              },
              required: ["itemName", "email"]
            }
          },
          {
            name: "get_board_items_by_name",
            description: "Search for items in Monday.com board",
            inputSchema: {
              type: "object",
              properties: {
                boardId: { type: "number", description: "Board ID (default: 2056518483)" },
                term: { type: "string", description: "Search term" }
              },
              required: ["boardId", "term"]
            }
          },
          {
            name: "change_item_column_values",
            description: "Update any column value for a specific item in Monday.com board",
            inputSchema: {
              type: "object",
              properties: {
                itemId: { type: "number", description: "Item ID" },
                columnId: { type: "string", description: "Column ID" },
                value: { type: "string", description: "Value to set" }
              },
              required: ["itemId", "columnId", "value"]
            }
          },
          {
            name: "get_board_schema",
            description: "Get board schema including columns",
            inputSchema: {
              type: "object",
              properties: {
                boardId: { type: "number", description: "Board ID (default: 2056518483)" }
              },
              required: ["boardId"]
            }
          }
        ]
      }
    };
    res.json(response);
    return;
  }
  
  if (method === 'tools/call') {
    const { name, arguments: args } = params;
    console.log(`🔧 MCP Tool Call: ${name}`, args);
    
    if (name === 'monday_email_updater') {
      updateEmailReal(args.itemName, args.email, args.boardId, args.itemId)
        .then(result => {
          res.json({
            jsonrpc: "2.0",
            id: id,
            result: {
              content: [{
                type: "text",
                text: `✅ Successfully updated email for item "${args.itemName}" to ${args.email}`
              }]
            }
          });
        })
        .catch(error => {
          res.json({
            jsonrpc: "2.0",
            id: id,
            error: {
              code: -32000,
              message: `Failed to update email: ${error.message}`
            }
          });
        });
      return;
    }
    
    if (name === 'get_board_items_by_name') {
      searchItemsReal(args.boardId, args.term)
        .then(result => {
          res.json({
            jsonrpc: "2.0",
            id: id,
            result: {
              content: [{
                type: "text",
                text: `Found ${result.items.length} items matching "${args.term}": ${JSON.stringify(result.items, null, 2)}`
              }]
            }
          });
        })
        .catch(error => {
          res.json({
            jsonrpc: "2.0",
            id: id,
            error: {
              code: -32000,
              message: `Failed to search items: ${error.message}`
            }
          });
        });
      return;
    }
    
    if (name === 'change_item_column_values') {
      updateColumnReal(args.itemId, args.columnId, args.value)
        .then(result => {
          res.json({
            jsonrpc: "2.0",
            id: id,
            result: {
              content: [{
                type: "text",
                text: `✅ Successfully updated column ${args.columnId} for item ${args.itemId}`
              }]
            }
          });
        })
        .catch(error => {
          res.json({
            jsonrpc: "2.0",
            id: id,
            error: {
              code: -32000,
              message: `Failed to update column: ${error.message}`
            }
          });
        });
      return;
    }
    
    if (name === 'get_board_schema') {
      getBoardSchemaReal(args.boardId)
        .then(result => {
          res.json({
            jsonrpc: "2.0",
            id: id,
            result: {
              content: [{
                type: "text",
                text: `Board schema: ${JSON.stringify(result, null, 2)}`
              }]
            }
          });
        })
        .catch(error => {
          res.json({
            jsonrpc: "2.0",
            id: id,
            error: {
              code: -32000,
              message: `Failed to get board schema: ${error.message}`
            }
          });
        });
      return;
    }
    
    res.json({
      jsonrpc: "2.0",
      id: id,
      error: {
        code: -32601,
        message: "Method not found"
      }
    });
    return;
  }
  
  res.json({
    jsonrpc: "2.0",
    id: id,
    error: {
      code: -32601,
      message: "Method not found"
    }
  });
});

// Real Monday.com API functions
async function updateEmailReal(itemName, email, boardId = BOARD_ID, itemId) {
  if (!MONDAY_API_TOKEN) {
    throw new Error("Monday.com API token not configured");
  }
  
  // If itemId is not provided, we need to find it by name
  if (!itemId) {
    const items = await searchItemsReal(boardId, itemName);
    if (items.items.length === 0) {
      throw new Error(`Item "${itemName}" not found in board ${boardId}`);
    }
    itemId = items.items[0].id;
  }
  
  try {
    const mutation = `
      mutation {
        change_column_value(
          board_id: ${boardId},
          item_id: ${itemId},
          column_id: "email_mktp3awp",
          value: "{\\"text\\": \\"${email}\\", \\"email\\": \\"${email}\\"}"
        ) {
          id
          name
        }
      }
    `;
    
    const response = await axios.post(MONDAY_API_URL, 
      { query: mutation },
      { 
        headers: { 
          'Authorization': MONDAY_API_TOKEN,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }
    
    return {
      status: "success",
      message: `Email updated for item "${itemName}" to ${email}`,
      itemName: itemName,
      email: email,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Monday.com API error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.errors?.[0]?.message || error.message);
  }
}

async function searchItemsReal(boardId = BOARD_ID, term) {
  if (!MONDAY_API_TOKEN) {
    throw new Error("Monday.com API token not configured");
  }
  
  try {
    const query = `
      query {
        boards(ids: [${boardId}]) {
          items_page {
            items {
              id
              name
                          column_values {
              id
              type
              value
              text
            }
            }
          }
        }
      }
    `;
    
    const response = await axios.post(MONDAY_API_URL,
      { query: query },
      {
        headers: {
          'Authorization': MONDAY_API_TOKEN,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }
    
    const items = response.data.data.boards[0].items_page.items;
    const filteredItems = items.filter(item => 
      item.name.toLowerCase().includes(term.toLowerCase())
    );
    
    return {
      items: filteredItems,
      total: filteredItems.length
    };
  } catch (error) {
    console.error('Monday.com API error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.errors?.[0]?.message || error.message);
  }
}

async function updateColumnReal(itemId, columnId, value) {
  if (!MONDAY_API_TOKEN) {
    throw new Error("Monday.com API token not configured");
  }
  
  try {
    const mutation = `
      mutation {
        change_column_value(
          board_id: ${BOARD_ID},
          item_id: ${itemId},
          column_id: "${columnId}",
          value: "${value}"
        ) {
          id
          name
        }
      }
    `;
    
    const response = await axios.post(MONDAY_API_URL,
      { query: mutation },
      {
        headers: {
          'Authorization': MONDAY_API_TOKEN,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }
    
    return {
      status: "success",
      message: `Column ${columnId} updated for item ${itemId}`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Monday.com API error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.errors?.[0]?.message || error.message);
  }
}

async function getBoardSchemaReal(boardId = BOARD_ID) {
  if (!MONDAY_API_TOKEN) {
    throw new Error("Monday.com API token not configured");
  }
  
  try {
    const query = `
      query {
        boards(ids: [${boardId}]) {
          id
          name
          columns {
            id
            title
            type
          }
        }
      }
    `;
    
    const response = await axios.post(MONDAY_API_URL,
      { query: query },
      {
        headers: {
          'Authorization': MONDAY_API_TOKEN,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }
    
    return response.data.data.boards[0];
  } catch (error) {
    console.error('Monday.com API error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.errors?.[0]?.message || error.message);
  }
}

// Direct HTTP endpoints for testing
app.post('/api/monday/update-email', async (req, res) => {
  const { itemName, email, boardId = BOARD_ID, itemId } = req.body;
  
  if (!itemName || !email) {
    return res.status(400).json({ error: 'itemName and email are required' });
  }
  
  try {
    const result = await updateEmailReal(itemName, email, boardId, itemId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/monday/search-items', async (req, res) => {
  const { boardId = BOARD_ID, term } = req.body;
  
  if (!term) {
    return res.status(400).json({ error: 'term is required' });
  }
  
  try {
    const result = await searchItemsReal(boardId, term);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/monday/update-column', async (req, res) => {
  const { itemId, columnId, value } = req.body;
  
  if (!itemId || !columnId || !value) {
    return res.status(400).json({ error: 'itemId, columnId, and value are required' });
  }
  
  try {
    const result = await updateColumnReal(itemId, columnId, value);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Production Monday.com MCP Server running on port ${PORT}`);
  console.log(`🔑 Monday.com API Token: ${MONDAY_API_TOKEN ? 'Configured' : 'NOT CONFIGURED'}`);
  console.log(`📋 Board ID: ${BOARD_ID}`);
  console.log(`📧 Email Column ID: email_mktp3awp`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`📝 Note: This server uses REAL Monday.com API - no mock data!`);
});
