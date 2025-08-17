const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Monday.com API configuration
const MONDAY_API_TOKEN = process.env.MONDAY_API_TOKEN;
const MONDAY_API_URL = 'https://api.monday.com/v2';

// Enhanced CORS for Dify.ai compatibility
app.use(cors({
  origin: ['https://cloud.dify.ai', 'https://*.dify.ai', 'https://*.dify.dev', 'http://localhost:3000'],
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
    message: "Railway MCP Server with Real Monday.com Integration",
    version: "2.0.0",
    protocol_version: "2025-03-26",
    monday_connected: !!MONDAY_API_TOKEN,
    note: "Real Monday.com API integration - no more mock data!"
  });
});

// MCP endpoint - Minimal for compatibility
app.post('/', (req, res) => {
  // Enhanced headers for Dify.ai
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  const { method, id, params } = req.body;
  
  console.log(`🔧 MCP Request: ${method}`);
  
  if (method === 'notifications/initialized') {
    // Return 204 No Content for notifications
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
            name: "update_email",
            description: "Updates email for a specific item in Monday.com board",
            inputSchema: {
              type: "object",
              properties: {
                itemName: {
                  type: "string",
                  description: "Name of the item to update"
                },
                email: {
                  type: "string",
                  description: "Email address to set",
                  format: "email"
                },
                boardId: {
                  type: "number",
                  description: "Monday.com board ID"
                },
                itemId: {
                  type: "number",
                  description: "Monday.com item ID"
                }
              },
              required: ["itemName", "email", "boardId", "itemId"]
            }
          },
          {
            name: "search_items",
            description: "Searches for items in Monday.com board",
            inputSchema: {
              type: "object",
              properties: {
                boardId: {
                  type: "number",
                  description: "Monday.com board ID"
                },
                term: {
                  type: "string",
                  description: "Search term"
                }
              },
              required: ["boardId", "term"]
            }
          },
          {
            name: "update_column",
            description: "Updates any column value for a specific item in Monday.com board",
            inputSchema: {
              type: "object",
              properties: {
                itemId: {
                  type: "number",
                  description: "Monday.com item ID"
                },
                columnId: {
                  type: "string",
                  description: "Column ID to update"
                },
                value: {
                  type: "string",
                  description: "Value to set"
                }
              },
              required: ["itemId", "columnId", "value"]
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
    
    if (name === 'update_email') {
      // Call the real Monday.com update
      updateEmailReal(args.itemName, args.email, args.boardId, args.itemId)
        .then(result => {
          res.json({
            jsonrpc: "2.0",
            id: id,
            result: {
              content: [
                {
                  type: "text",
                  text: `✅ Successfully updated email for item "${args.itemName}" to ${args.email}`
                }
              ]
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
    
    if (name === 'search_items') {
      // Call the real Monday.com search
      searchItemsReal(args.boardId, args.term)
        .then(result => {
          res.json({
            jsonrpc: "2.0",
            id: id,
            result: {
              content: [
                {
                  type: "text",
                  text: `Found ${result.items.length} items matching "${args.term}": ${result.items.map(item => item.name).join(', ')}`
                }
              ]
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
    
    if (name === 'update_column') {
      // Call the real Monday.com column update
      updateColumnReal(args.itemId, args.columnId, args.value)
        .then(result => {
          res.json({
            jsonrpc: "2.0",
            id: id,
            result: {
              content: [
                {
                  type: "text",
                  text: `✅ Successfully updated column ${args.columnId} for item ${args.itemId} to ${args.value}`
                }
              ]
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
  }
  
  // Default response
  res.json({
    jsonrpc: "2.0",
    id: id,
    error: {
      code: -32601,
      message: "Method not found"
    }
  });
});

// Real Monday.com email update function
async function updateEmailReal(itemName, email, boardId = 2056518483, itemId) {
  if (!MONDAY_API_TOKEN) {
    throw new Error("Monday.com API token not configured");
  }

  try {
    // Real Monday.com GraphQL mutation with correct email format
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

    return {
      status: "success",
      message: `Email updated for item "${itemName}" to ${email}`,
      itemName: itemName,
      email: email,
      monday_response: response.data
    };
  } catch (error) {
    console.error('Monday.com API error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.errors?.[0]?.message || error.message);
  }
}

// Real Monday.com item search function
async function searchItemsReal(boardId, term) {
  if (!MONDAY_API_TOKEN) {
    throw new Error("Monday.com API token not configured");
  }

  try {
    const query = `
      query {
        boards(ids: ${boardId}) {
          items_page {
            items {
              id
              name
              column_values {
                id
                text
                value
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

    const items = response.data.data.boards[0].items_page.items;
    const filteredItems = items.filter(item => 
      item.name.toLowerCase().includes(term.toLowerCase())
    );

    return {
      items: filteredItems,
      total: filteredItems.length,
      monday_response: response.data
    };
  } catch (error) {
    console.error('Monday.com API error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.errors?.[0]?.message || error.message);
  }
}

// Real Monday.com column update function
async function updateColumnReal(itemId, columnId, value) {
  if (!MONDAY_API_TOKEN) {
    throw new Error("Monday.com API token not configured");
  }

  try {
    const mutation = `
      mutation {
        change_column_value(
          board_id: 2056518483,
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

    return {
      itemId: itemId,
      status: "updated",
      message: "Column values updated successfully",
      monday_response: response.data
    };
  } catch (error) {
    console.error('Monday.com API error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.errors?.[0]?.message || error.message);
  }
}

// Direct HTTP endpoints for Monday.com operations (for testing)
app.post('/api/monday/update-email', async (req, res) => {
  const { itemName, email, boardId = 2056518483, itemId } = req.body;
  
  if (!itemName || !email) {
    return res.status(400).json({
      error: "Missing required fields: itemName and email"
    });
  }

  try {
    const result = await updateEmailReal(itemName, email, boardId, itemId);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: "Failed to update Monday.com",
      details: error.message
    });
  }
});

app.post('/api/monday/search-items', async (req, res) => {
  const { boardId, term } = req.body;
  
  if (!boardId || !term) {
    return res.status(400).json({
      error: "Missing required fields: boardId and term"
    });
  }

  try {
    const result = await searchItemsReal(boardId, term);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: "Failed to search Monday.com",
      details: error.message
    });
  }
});

app.post('/api/monday/update-column', async (req, res) => {
  const { itemId, columnId, value } = req.body;
  
  if (!itemId || !columnId || !value) {
    return res.status(400).json({
      error: "Missing required fields: itemId, columnId, and value"
    });
  }

  try {
    const result = await updateColumnReal(itemId, columnId, value);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: "Failed to update Monday.com column",
      details: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Railway MCP Server with Real Monday.com Integration running on port ${PORT}`);
  console.log(`🔑 Monday.com API Token: ${MONDAY_API_TOKEN ? 'Configured' : 'NOT CONFIGURED'}`);
  console.log(`📋 Board ID: 2056518483`);
  console.log(`📧 Email Column ID: email_mktp3awp`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`📝 Note: This server uses REAL Monday.com API - no mock data!`);
});
