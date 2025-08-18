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

// Board knowledge cache
let boardKnowledge = {
  items: [],
  columns: [],
  lastUpdated: null
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
  if (lowerText.includes('list all') || lowerText.includes('show all')) {
    return { action: 'list_all' };
  }
  
  return { action: 'unknown', message: 'Try: "change email of task 1 to user@example.com"' };
}

// Update board knowledge
async function updateBoardKnowledge() {
  try {
    const query = `
      query {
        boards(ids: ${BOARD_ID}) {
          items_page {
            items {
              id
              name
              column_values {
                id
                title
                text
                value
              }
            }
          }
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
    
    const board = response.data.data.boards[0];
    boardKnowledge = {
      items: board.items_page.items,
      columns: board.columns,
      lastUpdated: new Date().toISOString()
    };
    
    console.log(`📋 Board updated: ${boardKnowledge.items.length} items`);
    return boardKnowledge;
  } catch (error) {
    console.error('Failed to update board knowledge:', error.message);
    return boardKnowledge;
  }
}

// Find item by name
function findItemByName(itemName) {
  const searchTerm = itemName.toLowerCase();
  return boardKnowledge.items.find(item => 
    item.name.toLowerCase().includes(searchTerm)
  );
}

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: "ok",
    message: "Chatbot MCP Server with Natural Language Processing",
    version: "3.0.0",
    board_info: {
      items_count: boardKnowledge.items.length,
      last_updated: boardKnowledge.lastUpdated
    }
  });
});

// MCP endpoint
app.post('/', async (req, res) => {
  const { method, id, params } = req.body;
  
  if (method === 'notifications/initialized') {
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
            description: "Process natural language commands. Examples: 'change email of task 1 to user@example.com', 'find task 2', 'list all tasks'",
            inputSchema: {
              type: "object",
              properties: {
                command: {
                  type: "string",
                  description: "Natural language command"
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
                itemName: { type: "string" },
                email: { type: "string", format: "email" }
              },
              required: ["itemName", "email"]
            }
          },
          {
            name: "list_all_items",
            description: "List all tasks in the board",
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
      await updateBoardKnowledge();
      
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
            const emailColumn = item.column_values.find(col => col.id === 'email_mktp3awp');
            res.json({
              jsonrpc: "2.0",
              id: id,
              result: {
                content: [{ 
                  type: "text", 
                  text: `Found task "${item.name}": ${emailColumn ? `Email: ${emailColumn.text}` : 'No email set'}` 
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
                  text: `❌ Task "${parsed.itemName}" not found. Available: ${boardKnowledge.items.map(i => i.name).join(', ')}` 
                }]
              }
            });
          }
          return;
        }
        
        if (parsed.action === 'list_all') {
          const itemsList = boardKnowledge.items.map(item => {
            const emailColumn = item.column_values.find(col => col.id === 'email_mktp3awp');
            return `• Task "${item.name}": ${emailColumn ? `Email: ${emailColumn.text}` : 'No email set'}`;
          }).join('\n');
          
          res.json({
            jsonrpc: "2.0",
            id: id,
            result: {
              content: [{ type: "text", text: `📋 All tasks:\n${itemsList}` }]
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
        const itemsList = boardKnowledge.items.map(item => {
          const emailColumn = item.column_values.find(col => col.id === 'email_mktp3awp');
          return `• Task "${item.name}": ${emailColumn ? `Email: ${emailColumn.text}` : 'No email set'}`;
        }).join('\n');
        
        res.json({
          jsonrpc: "2.0",
          id: id,
          result: {
            content: [{ type: "text", text: `📋 All tasks:\n${itemsList}` }]
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
    throw new Error(`Task "${itemName}" not found. Available: ${boardKnowledge.items.map(i => i.name).join(', ')}`);
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

    await updateBoardKnowledge();

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
app.listen(PORT, async () => {
  console.log(`🚀 Chatbot MCP Server running on port ${PORT}`);
  console.log(`🔑 Monday.com API Token: ${MONDAY_API_TOKEN ? 'Configured' : 'NOT CONFIGURED'}`);
  console.log(`📋 Board ID: ${BOARD_ID}`);
  console.log(`🤖 Ready for natural language commands!`);
  
  await updateBoardKnowledge();
});
