const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Monday.com API configuration
const MONDAY_API_TOKEN = process.env.MONDAY_API_TOKEN;
const MONDAY_API_URL = 'https://api.monday.com/v2';

// Board configuration
const BOARD_ID = 2056518483;
const BOARD_NAME = "Project Management Board";

// Enhanced CORS for Dify.ai compatibility
app.use(cors({
  origin: ['https://cloud.dify.ai', 'https://*.dify.ai', 'https://*.dify.dev', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '1mb' }));

// Board knowledge cache
let boardKnowledge = {
  boardId: BOARD_ID,
  boardName: BOARD_NAME,
  columns: [],
  items: [],
  lastUpdated: null
};

// Natural language processing functions
function parseNaturalLanguageCommand(text) {
  const lowerText = text.toLowerCase();
  
  // Email update patterns
  const emailPatterns = [
    /change\s+(?:the\s+)?email\s+(?:of\s+)?(?:task\s+)?(\w+)\s+to\s+([^\s]+@[^\s]+)/i,
    /update\s+(?:the\s+)?email\s+(?:of\s+)?(?:task\s+)?(\w+)\s+to\s+([^\s]+@[^\s]+)/i,
    /set\s+(?:the\s+)?email\s+(?:of\s+)?(?:task\s+)?(\w+)\s+to\s+([^\s]+@[^\s]+)/i,
    /(\w+)\s+email\s+(?:to\s+)?([^\s]+@[^\s]+)/i
  ];
  
  for (const pattern of emailPatterns) {
    const match = text.match(pattern);
    if (match) {
      return {
        action: 'update_email',
        itemName: match[1],
        email: match[2]
      };
    }
  }
  
  // Search patterns
  const searchPatterns = [
    /find\s+(?:task\s+)?(\w+)/i,
    /search\s+(?:for\s+)?(?:task\s+)?(\w+)/i,
    /show\s+(?:me\s+)?(?:task\s+)?(\w+)/i,
    /what\s+(?:is\s+)?(?:task\s+)?(\w+)/i
  ];
  
  for (const pattern of searchPatterns) {
    const match = text.match(pattern);
    if (match) {
      return {
        action: 'search_item',
        itemName: match[1]
      };
    }
  }
  
  // List all items
  if (lowerText.includes('list all') || lowerText.includes('show all') || lowerText.includes('what tasks')) {
    return {
      action: 'list_all_items'
    };
  }
  
  // Board info
  if (lowerText.includes('board info') || lowerText.includes('board details') || lowerText.includes('columns')) {
    return {
      action: 'get_board_info'
    };
  }
  
  return {
    action: 'unknown',
    message: `I don't understand that command. Try: "change email of task 1 to user@example.com" or "find task 2"`
  };
}

// Enhanced board knowledge functions
async function updateBoardKnowledge() {
  try {
    // Get board schema
    const schemaQuery = `
      query {
        boards(ids: ${BOARD_ID}) {
          name
          columns {
            id
            title
            type
            settings_str
          }
          items_page {
            items {
              id
              name
              column_values {
                id
                title
                text
                value
                type
              }
            }
          }
        }
      }
    `;
    
    const response = await axios.post(MONDAY_API_URL, 
      { query: schemaQuery },
      {
        headers: {
          'Authorization': MONDAY_API_TOKEN,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const board = response.data.data.boards[0];
    boardKnowledge = {
      boardId: BOARD_ID,
      boardName: board.name,
      columns: board.columns,
      items: board.items_page.items,
      lastUpdated: new Date().toISOString()
    };
    
    console.log(`📋 Board knowledge updated: ${boardKnowledge.items.length} items, ${boardKnowledge.columns.length} columns`);
    return boardKnowledge;
  } catch (error) {
    console.error('Failed to update board knowledge:', error.message);
    return boardKnowledge;
  }
}

// Find item by name or partial match
function findItemByName(itemName) {
  const searchTerm = itemName.toLowerCase();
  return boardKnowledge.items.find(item => 
    item.name.toLowerCase().includes(searchTerm) || 
    searchTerm.includes(item.name.toLowerCase())
  );
}

// Find column by name or partial match
function findColumnByName(columnName) {
  const searchTerm = columnName.toLowerCase();
  return boardKnowledge.columns.find(column => 
    column.title.toLowerCase().includes(searchTerm) || 
    searchTerm.includes(column.title.toLowerCase())
  );
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-cache');
  res.json({
    status: "ok",
    message: "Enhanced MCP Server with Board Knowledge",
    version: "3.0.0",
    protocol_version: "2025-03-26",
    monday_connected: !!MONDAY_API_TOKEN,
    board_info: {
      id: BOARD_ID,
      name: BOARD_NAME,
      items_count: boardKnowledge.items.length,
      columns_count: boardKnowledge.columns.length,
      last_updated: boardKnowledge.lastUpdated
    },
    note: "Enhanced for chatbot integration with natural language processing!"
  });
});

// MCP endpoint with enhanced capabilities
app.post('/', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  const { method, id, params } = req.body;
  
  console.log(`🔧 MCP Request: ${method}`);
  
  if (method === 'notifications/initialized') {
    // Update board knowledge on initialization
    await updateBoardKnowledge();
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
            name: "natural_language_command",
            description: "Process natural language commands for Monday.com board operations. Examples: 'change email of task 1 to user@example.com', 'find task 2', 'list all tasks'",
            inputSchema: {
              type: "object",
              properties: {
                command: {
                  type: "string",
                  description: "Natural language command to execute"
                }
              },
              required: ["command"]
            }
          },
          {
            name: "update_email",
            description: "Updates email for a specific item in Monday.com board",
            inputSchema: {
              type: "object",
              properties: {
                itemName: {
                  type: "string",
                  description: "Name of the item to update (e.g., '1', '2', '3')"
                },
                email: {
                  type: "string",
                  description: "Email address to set",
                  format: "email"
                }
              },
              required: ["itemName", "email"]
            }
          },
          {
            name: "search_items",
            description: "Searches for items in Monday.com board",
            inputSchema: {
              type: "object",
              properties: {
                term: {
                  type: "string",
                  description: "Search term or item name"
                }
              },
              required: ["term"]
            }
          },
          {
            name: "list_all_items",
            description: "Lists all items in the Monday.com board with their details",
            inputSchema: {
              type: "object",
              properties: {}
            }
          },
          {
            name: "get_board_info",
            description: "Gets comprehensive information about the board including columns and structure",
            inputSchema: {
              type: "object",
              properties: {}
            }
          },
          {
            name: "update_column_value",
            description: "Updates any column value for a specific item",
            inputSchema: {
              type: "object",
              properties: {
                itemName: {
                  type: "string",
                  description: "Name of the item to update"
                },
                columnName: {
                  type: "string",
                  description: "Name of the column to update"
                },
                value: {
                  type: "string",
                  description: "Value to set"
                }
              },
              required: ["itemName", "columnName", "value"]
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
    
    try {
      // Update board knowledge before processing
      await updateBoardKnowledge();
      
      if (name === 'natural_language_command') {
        const parsed = parseNaturalLanguageCommand(args.command);
        
        if (parsed.action === 'update_email') {
          const result = await updateEmailReal(parsed.itemName, parsed.email);
          res.json({
            jsonrpc: "2.0",
            id: id,
            result: {
              content: [
                {
                  type: "text",
                  text: `✅ ${result.message}`
                }
              ]
            }
          });
          return;
        }
        
        if (parsed.action === 'search_item') {
          const item = findItemByName(parsed.itemName);
          if (item) {
            const emailColumn = item.column_values.find(col => col.id === 'email_mktp3awp');
            res.json({
              jsonrpc: "2.0",
              id: id,
              result: {
                content: [
                  {
                    type: "text",
                    text: `Found task "${item.name}": ${emailColumn ? `Email: ${emailColumn.text}` : 'No email set'}`
                  }
                ]
              }
            });
          } else {
            res.json({
              jsonrpc: "2.0",
              id: id,
              result: {
                content: [
                  {
                    type: "text",
                    text: `❌ Task "${parsed.itemName}" not found. Available tasks: ${boardKnowledge.items.map(i => i.name).join(', ')}`
                  }
                ]
              }
            });
          }
          return;
        }
        
        if (parsed.action === 'list_all_items') {
          const itemsList = boardKnowledge.items.map(item => {
            const emailColumn = item.column_values.find(col => col.id === 'email_mktp3awp');
            return `• Task "${item.name}": ${emailColumn ? `Email: ${emailColumn.text}` : 'No email set'}`;
          }).join('\n');
          
          res.json({
            jsonrpc: "2.0",
            id: id,
            result: {
              content: [
                {
                  type: "text",
                  text: `📋 All tasks in board "${boardKnowledge.boardName}":\n${itemsList}`
                }
              ]
            }
          });
          return;
        }
        
        if (parsed.action === 'get_board_info') {
          const columnsList = boardKnowledge.columns.map(col => `• ${col.title} (${col.type})`).join('\n');
          res.json({
            jsonrpc: "2.0",
            id: id,
            result: {
              content: [
                {
                  type: "text",
                  text: `📊 Board: "${boardKnowledge.boardName}"\n📋 Columns:\n${columnsList}\n📝 Items: ${boardKnowledge.items.length}`
                }
              ]
            }
          });
          return;
        }
        
        res.json({
          jsonrpc: "2.0",
          id: id,
          result: {
            content: [
              {
                type: "text",
                text: parsed.message
              }
            ]
          }
        });
        return;
      }
      
      if (name === 'update_email') {
        const result = await updateEmailReal(args.itemName, args.email);
        res.json({
          jsonrpc: "2.0",
          id: id,
          result: {
            content: [
              {
                type: "text",
                text: `✅ ${result.message}`
              }
            ]
          }
        });
        return;
      }
      
      if (name === 'search_items') {
        const item = findItemByName(args.term);
        if (item) {
          const emailColumn = item.column_values.find(col => col.id === 'email_mktp3awp');
          res.json({
            jsonrpc: "2.0",
            id: id,
            result: {
              content: [
                {
                  type: "text",
                  text: `Found task "${item.name}": ${emailColumn ? `Email: ${emailColumn.text}` : 'No email set'}`
                }
              ]
            }
          });
        } else {
          res.json({
            jsonrpc: "2.0",
            id: id,
            result: {
              content: [
                {
                  type: "text",
                  text: `❌ Task "${args.term}" not found. Available tasks: ${boardKnowledge.items.map(i => i.name).join(', ')}`
                }
              ]
            }
          });
        }
        return;
      }
      
      if (name === 'list_all_items') {
        const itemsList = boardKnowledge.items.map(item => {
          const emailColumn = item.column_values.find(col => col.id === 'email_mktp3awp');
          return `• Task "${item.name}": ${emailColumn ? `Email: ${emailColumn.text}` : 'No email set'}`;
        }).join('\n');
        
        res.json({
          jsonrpc: "2.0",
          id: id,
          result: {
            content: [
              {
                type: "text",
                text: `📋 All tasks in board "${boardKnowledge.boardName}":\n${itemsList}`
              }
            ]
          }
        });
        return;
      }
      
      if (name === 'get_board_info') {
        const columnsList = boardKnowledge.columns.map(col => `• ${col.title} (${col.type})`).join('\n');
        res.json({
          jsonrpc: "2.0",
          id: id,
          result: {
            content: [
              {
                type: "text",
                text: `📊 Board: "${boardKnowledge.boardName}"\n📋 Columns:\n${columnsList}\n📝 Items: ${boardKnowledge.items.length}`
              }
            ]
          }
        });
        return;
      }
      
      if (name === 'update_column_value') {
        const item = findItemByName(args.itemName);
        const column = findColumnByName(args.columnName);
        
        if (!item) {
          res.json({
            jsonrpc: "2.0",
            id: id,
            error: {
              code: -32000,
              message: `Task "${args.itemName}" not found. Available tasks: ${boardKnowledge.items.map(i => i.name).join(', ')}`
            }
          });
          return;
        }
        
        if (!column) {
          res.json({
            jsonrpc: "2.0",
            id: id,
            error: {
              code: -32000,
              message: `Column "${args.columnName}" not found. Available columns: ${boardKnowledge.columns.map(c => c.title).join(', ')}`
            }
          });
          return;
        }
        
        const result = await updateColumnReal(item.id, column.id, args.value);
        res.json({
          jsonrpc: "2.0",
          id: id,
          result: {
            content: [
              {
                type: "text",
                text: `✅ Updated ${column.title} for task "${item.name}" to "${args.value}"`
              }
            ]
          }
        });
        return;
      }
      
    } catch (error) {
      res.json({
        jsonrpc: "2.0",
        id: id,
        error: {
          code: -32000,
          message: `Failed to execute ${name}: ${error.message}`
        }
      });
      return;
    }
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

// Real Monday.com email update function
async function updateEmailReal(itemName, email) {
  if (!MONDAY_API_TOKEN) {
    throw new Error("Monday.com API token not configured");
  }

  const item = findItemByName(itemName);
  if (!item) {
    throw new Error(`Task "${itemName}" not found. Available tasks: ${boardKnowledge.items.map(i => i.name).join(', ')}`);
  }

  try {
    const mutation = `
      mutation {
        change_column_value(
          board_id: ${BOARD_ID},
          item_id: ${item.id},
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

    // Update local knowledge
    await updateBoardKnowledge();

    return {
      status: "success",
      message: `Email updated for task "${itemName}" to ${email}`,
      itemName: itemName,
      email: email,
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

    // Update local knowledge
    await updateBoardKnowledge();

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

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Enhanced MCP Server with Board Knowledge running on port ${PORT}`);
  console.log(`🔑 Monday.com API Token: ${MONDAY_API_TOKEN ? 'Configured' : 'NOT CONFIGURED'}`);
  console.log(`📋 Board ID: ${BOARD_ID}`);
  console.log(`📧 Email Column ID: email_mktp3awp`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`🤖 Enhanced for chatbot integration with natural language processing!`);
  
  // Initialize board knowledge
  await updateBoardKnowledge();
});
