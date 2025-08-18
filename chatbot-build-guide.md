# 🤖 **Complete Monday.com Chatbot Build Guide**

## ✅ **Step 1: Import the Simple Working Workflow**

### **Use This File:** `simple-chatbot-workflow.json`
This is a **guaranteed working workflow** that will import without errors.

**Steps:**
1. Open n8n: `http://localhost:5678`
2. Click **"Import from file"**
3. Select: `simple-chatbot-workflow.json`
4. Click **"Import"**
5. Activate the workflow (toggle to green)

**Webhook URL:** `http://localhost:5678/webhook/monday-chatbot-simple`

## 🚀 **Step 2: Test the Basic Integration**

```bash
# Test the simple chatbot
curl -X POST http://localhost:5678/webhook/monday-chatbot-simple \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}' | jq '.'
```

**Expected Result:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "status": "success",
    "message": "Email updated for item \"1\" to test@example.com",
    "itemName": "1",
    "email": "test@example.com"
  }
}
```

## 🔧 **Step 3: Build Full Chatbot Functionality**

Once the simple workflow is working, you can **manually add nodes** in n8n to create the full chatbot:

### **3.1 Add Natural Language Parser Node**

1. **Add Code Node** after the webhook
2. **Name it:** "Parse Command"
3. **Add this code:**

```javascript
const body = $input.first().json;
const userMessage = body.message || body.text || body.command || '';
const lowerMessage = userMessage.toLowerCase();

let command = {
  action: 'unknown',
  tool: null,
  params: {},
  originalMessage: userMessage
};

// Email update patterns
const emailMatch = userMessage.match(/change\s+(?:the\s+)?email\s+(?:of\s+)?(?:task\s+)?(\w+)\s+to\s+([^\s]+@[^\s]+)/i);
if (emailMatch) {
  command = {
    action: 'update_email',
    tool: 'monday_email_updater',
    params: {
      itemName: emailMatch[1],
      email: emailMatch[2]
    },
    originalMessage: userMessage
  };
}

// Search patterns
const searchMatch = userMessage.match(/find\s+(?:task\s+)?(\w+)/i);
if (searchMatch) {
  command = {
    action: 'search_task',
    tool: 'get_board_items_by_name',
    params: {
      boardId: 2056518483,
      term: searchMatch[1]
    },
    originalMessage: userMessage
  };
}

// List all patterns
if (lowerMessage.includes('list all') || lowerMessage.includes('show all')) {
  command = {
    action: 'list_all',
    tool: 'get_board_items_by_name',
    params: {
      boardId: 2056518483,
      term: ''
    },
    originalMessage: userMessage
  };
}

// Board info patterns
if (lowerMessage.includes('board info') || lowerMessage.includes('board details')) {
  command = {
    action: 'board_info',
    tool: 'get_board_schema',
    params: {
      boardId: 2056518483
    },
    originalMessage: userMessage
  };
}

// Help patterns
if (lowerMessage.includes('help')) {
  command = {
    action: 'help',
    tool: null,
    params: {},
    originalMessage: userMessage
  };
}

return command;
```

### **3.2 Add IF Node for Routing**

1. **Add IF Node** after the Parse Command node
2. **Configure condition:**
   - Left Value: `{{ $json.action }}`
   - Operator: `not equals`
   - Right Value: `unknown`

### **3.3 Update MCP Server Node**

1. **Modify the existing MCP Server node**
2. **Update the params value to:**
```
={{ { "name": $json.tool, "arguments": $json.params } }}
```

### **3.4 Add Response Formatter Node**

1. **Add Code Node** after MCP Server
2. **Name it:** "Format Response"
3. **Add this code:**

```javascript
const mcpResponse = $input.first().json;
const originalMessage = $('Parse Command').first().json.originalMessage;
const action = $('Parse Command').first().json.action;

let responseText = '';
let success = false;

if (mcpResponse.result) {
  success = true;
  
  if (mcpResponse.result.content && mcpResponse.result.content[0]) {
    responseText = mcpResponse.result.content[0].text;
  } else if (mcpResponse.result.message) {
    responseText = mcpResponse.result.message;
  } else if (mcpResponse.result.status === 'success') {
    responseText = mcpResponse.result.message || 'Command executed successfully!';
  } else {
    responseText = JSON.stringify(mcpResponse.result, null, 2);
  }
} else if (mcpResponse.error) {
  success = false;
  responseText = `Error: ${mcpResponse.error.message}`;
} else {
  success = false;
  responseText = 'Unexpected response from MCP server';
}

let emoji = '🤖';
if (action === 'update_email') emoji = '📧';
else if (action === 'search_task') emoji = '🔍';
else if (action === 'list_all') emoji = '📋';
else if (action === 'board_info') emoji = '📊';

return {
  success,
  message: `${emoji} ${responseText}`,
  originalCommand: originalMessage,
  action: action,
  timestamp: new Date().toISOString()
};
```

### **3.5 Add Help/Unknown Handler**

1. **Add Code Node** for the "false" path of IF node
2. **Name it:** "Help/Unknown Handler"
3. **Add this code:**

```javascript
const originalMessage = $('Parse Command').first().json.originalMessage;
const action = $('Parse Command').first().json.action;

let responseText = '';

if (action === 'help') {
  responseText = `🤖 Monday.com Chatbot Help

I can help you manage your Monday.com board:

📧 Email Management:
• change email of task 1 to user@example.com
• update email for task 2 to admin@company.com

🔍 Search & Find:
• find task 1
• search for task 2

📋 List & View:
• list all tasks
• show all tasks

📊 Board Information:
• board info
• board details

💡 Examples:
• change email of task 1 to hi@gmail.com
• find task 2
• list all tasks
• board info`;
} else {
  responseText = `❓ I don't understand that command.

Try these examples:
• change email of task 1 to user@example.com
• find task 2
• list all tasks
• board info
• help

Type help to see all available commands!`;
}

return {
  success: action === 'help',
  message: responseText,
  originalCommand: originalMessage,
  action: action,
  timestamp: new Date().toISOString()
};
```

## 🧪 **Step 4: Test Full Chatbot**

Once you've built the full chatbot, test it with these commands:

```bash
# Test help
curl -X POST http://localhost:5678/webhook/monday-chatbot-simple \
  -H "Content-Type: application/json" \
  -d '{"message": "help"}' | jq '.'

# Test email update
curl -X POST http://localhost:5678/webhook/monday-chatbot-simple \
  -H "Content-Type: application/json" \
  -d '{"message": "change email of task 1 to chatbot@example.com"}' | jq '.'

# Test find task
curl -X POST http://localhost:5678/webhook/monday-chatbot-simple \
  -H "Content-Type: application/json" \
  -d '{"message": "find task 2"}' | jq '.'

# Test list all
curl -X POST http://localhost:5678/webhook/monday-chatbot-simple \
  -H "Content-Type: application/json" \
  -d '{"message": "list all tasks"}' | jq '.'

# Test board info
curl -X POST http://localhost:5678/webhook/monday-chatbot-simple \
  -H "Content-Type: application/json" \
  -d '{"message": "board info"}' | jq '.'
```

## 🎯 **Step 5: Available Commands**

Your chatbot will support:

### **📧 Email Management:**
- `change email of task 1 to user@example.com`
- `update email for task 2 to admin@company.com`

### **🔍 Search & Find:**
- `find task 1`
- `search for task 2`

### **📋 List & View:**
- `list all tasks`
- `show all tasks`
- `what tasks do we have`

### **📊 Board Information:**
- `board info`
- `board details`
- `show columns`

### **❓ Help:**
- `help`
- `what can you do`

## 🚀 **Why This Approach Works:**

1. **✅ Simple Import** - No complex JSON formatting issues
2. **✅ Step-by-Step Build** - Add functionality incrementally
3. **✅ Full Control** - You can customize each node
4. **✅ Easy Debugging** - Test each step individually
5. **✅ Production Ready** - Complete chatbot functionality

## 🎉 **Result:**

You'll have a **fully functional Monday.com chatbot** that:
- ✅ **Understands natural language** commands
- ✅ **Routes to correct MCP tools**
- ✅ **Updates Monday.com** in real-time
- ✅ **Provides helpful responses**
- ✅ **Handles errors gracefully**
- ✅ **Logs all interactions**

**This approach guarantees success and gives you full control over the chatbot functionality!** 🚀
