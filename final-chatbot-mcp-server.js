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

// Comprehensive board knowledge (pre-loaded for chatbot)
const BOARD_KNOWLEDGE = {
  boardId: BOARD_ID,
  boardName: "Project Management Board",
  items: [
    {
      id: "2056518491",
      name: "1",
      email: "hihijks@gmail.com"
    },
    {
      id: "2056518492", 
      name: "2",
      email: "hihijks@gmail.com"
    },
    {
      id: "2056518493",
      name: "3", 
      email: "hihijks@gmail.com"
    }
  ],
  columns: [
    { id: "project_owner", title: "Project Owner", type: "people" },
    { id: "project_status", title: "Project Status", type: "status" },
    { id: "email_mktp3awp", title: "Email", type: "email" },
    { id: "date", title: "Date", type: "date" },
    { id: "text9", title: "Text", type: "text" },
    { id: "project_timeline", title: "Project Timeline", type: "date_range" }
  ]
};

// Natural language processing
function parseCommand(text) {
  const lowerText = text.toLowerCase();
  
  // Email update patterns
  const emailMatch = text.match(/change\s+(?:the\s+)?email\s+(?:of\s+)?(?:task\s+)?(\w+)\s+to\s+([^\s]+@[^\s]+)/i);
  if (emailMatch) {
    return { action: 'update_email', itemName: emailMatch[1], email: emailMatch[2] };
  }
  
  // Search patterns
  const searchMatch = text.match(/find\s+(?:task\s+)?(\w+)/i);
  if (searchMatch) {
    return { action: 'search_item', itemName: searchMatch[1] };
  }
  
  // List all
  if (lowerText.includes('list all') || lowerText.includes('show all') || lowerText.includes('what tasks')) {
    return { action: 'list_all' };
  }
  
  // Board info
  if (lowerText.includes('board info') || lowerText.includes('board details') || lowerText.includes('columns')) {
    return { action: 'board_info' };
  }
  
  return { 
    action: 'unknown', 
    message: 'Try: "change email of task 1 to user@example.com", "find task 2", "list all tasks", or "board info"' 
  };
}

// Find item by name
function findItemByName(itemName) {
  const searchTerm = itemName.toLowerCase();
  return BOARD_KNOWLEDGE.items.find(item => 
    item.name.toLowerCase().includes(searchTerm)
  );
}

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: "ok",
    message: "Final Chatbot MCP Server with Complete Board Knowledge",
    version: "4.0.0",
    board_info: {
      id: BOARD_ID,
      name: BOARD_KNOWLEDGE.boardName,
      items_count: BOARD_KNOWLEDGE.items.length,
      columns_count: BOARD_KNOWLEDGE.columns.length
    },
    note: "Ready for chatbot integration with natural language processing!"
  });
});

// MCP endpoint
app.post('/', async (req, res) => {
  const { method, id, params } = req.body;
  
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
            name: "natural_language_command",
            description: "Process natural language commands for Monday.com board operations. Examples: 'change email of task 1 to user@example.com', 'find task 2', 'list all tasks', 'board info'",
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
            description: "Update email for a specific task",
            inputSchema: {
              type: "object",
              properties: {
                itemName: { type: "string", description: "Task name (e.g., '1', '2', '3')" },
                email: { type: "string", format: "email", description: "Email address to set" }
              },
              required: ["itemName", "email"]
            }
          },
          {
            name: "list_all_items",
            description: "List all tasks in the board with their current email addresses",
            inputSchema: {
              type: "object",
              properties: {}
            }
          },
          {
            name: "get_board_info",
            description: "Get comprehensive information about the board including all columns and structure",
            inputSchema: {
              type: "object",
              properties: {}
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
    
    try {
      if (name === 'natural_language_command') {
        const parsed = parseCommand(args.command);
        
        if (parsed.action === 'update_email') {
          const result = await updateEmailReal(parsed.itemName, parsed.email);
          res.json({
            jsonrpc: "2.0",
            id: id,
            result: {
              content: [{ type: "text", text: `✅ ${result.message}` }]
            }
          });
          return;
        }
        
        if (parsed.action === 'search_item') {
          const item = findItemByName(parsed.itemName);
          if (item) {
            res.json({
              jsonrpc: "2.0",
              id: id,
              result: {
                content: [{ 
                  type: "text", 
                  text: `Found task "${item.name}": Email: ${item.email}` 
                }]
              }
            });
          } else {
            res.json({
              jsonrpc: "2.0",
              id: id,
              result: {
                content: [{ 
                  type: "text", 
                  text: `❌ Task "${parsed.itemName}" not found. Available tasks: ${BOARD_KNOWLEDGE.items.map(i => i.name).join(', ')}` 
                }]
              }
            });
          }
          return;
        }
        
        if (parsed.action === 'list_all') {
          const itemsList = BOARD_KNOWLEDGE.items.map(item => 
            `• Task "${item.name}": Email: ${item.email}`
          ).join('\n');
          
          res.json({
            jsonrpc: "2.0",
            id: id,
            result: {
              content: [{ type: "text", text: `📋 All tasks in board "${BOARD_KNOWLEDGE.boardName}":\n${itemsList}` }]
            }
          });
          return;
        }
        
        if (parsed.action === 'board_info') {
          const columnsList = BOARD_KNOWLEDGE.columns.map(col => 
            `• ${col.title} (${col.type})`
          ).join('\n');
          
          res.json({
            jsonrpc: "2.0",
            id: id,
            result: {
              content: [{ 
                type: "text", 
                text: `📊 Board: "${BOARD_KNOWLEDGE.boardName}"\n📋 Columns:\n${columnsList}\n📝 Total Items: ${BOARD_KNOWLEDGE.items.length}` 
              }]
            }
          });
          return;
        }
        
        res.json({
          jsonrpc: "2.0",
          id: id,
          result: {
            content: [{ type: "text", text: parsed.message }]
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
            content: [{ type: "text", text: `✅ ${result.message}` }]
          }
        });
        return;
      }
      
      if (name === 'list_all_items') {
        const itemsList = BOARD_KNOWLEDGE.items.map(item => 
          `• Task "${item.name}": Email: ${item.email}`
        ).join('\n');
        
        res.json({
          jsonrpc: "2.0",
          id: id,
          result: {
            content: [{ type: "text", text: `📋 All tasks in board "${BOARD_KNOWLEDGE.boardName}":\n${itemsList}` }]
          }
        });
        return;
      }
      
      if (name === 'get_board_info') {
        const columnsList = BOARD_KNOWLEDGE.columns.map(col => 
          `• ${col.title} (${col.type})`
        ).join('\n');
        
        res.json({
          jsonrpc: "2.0",
          id: id,
          result: {
            content: [{ 
              type: "text", 
              text: `📊 Board: "${BOARD_KNOWLEDGE.boardName}"\n📋 Columns:\n${columnsList}\n📝 Total Items: ${BOARD_KNOWLEDGE.items.length}` 
            }]
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

// Real Monday.com email update
async function updateEmailReal(itemName, email) {
  if (!MONDAY_API_TOKEN) {
    throw new Error("Monday.com API token not configured");
  }

  const item = findItemByName(itemName);
  if (!item) {
    throw new Error(`Task "${itemName}" not found. Available tasks: ${BOARD_KNOWLEDGE.items.map(i => i.name).join(', ')}`);
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
    item.email = email;

    return {
      status: "success",
      message: `Email updated for task "${itemName}" to ${email}`,
      itemName: itemName,
      email: email
    };
  } catch (error) {
    console.error('Monday.com API error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.errors?.[0]?.message || error.message);
  }
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Final Chatbot MCP Server running on port ${PORT}`);
  console.log(`🔑 Monday.com API Token: ${MONDAY_API_TOKEN ? 'Configured' : 'NOT CONFIGURED'}`);
  console.log(`📋 Board ID: ${BOARD_ID}`);
  console.log(`📧 Email Column ID: email_mktp3awp`);
  console.log(`🤖 Ready for natural language commands!`);
  console.log(`📋 Board Knowledge: ${BOARD_KNOWLEDGE.items.length} items, ${BOARD_KNOWLEDGE.columns.length} columns`);
  console.log(`💡 Try: "change email of task 1 to user@example.com"`);
});
