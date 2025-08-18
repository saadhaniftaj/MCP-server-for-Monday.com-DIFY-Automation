# 🤖 n8n + MCP Server Integration Guide

## 🎯 **What We're Building**

A powerful automation workflow that:
- ✅ Receives natural language commands via webhook
- ✅ Processes commands using your MCP server
- ✅ Updates Monday.com board in real-time
- ✅ Provides intelligent responses
- ✅ Logs all interactions

## 📋 **Prerequisites**

- ✅ n8n running locally (`http://localhost:5678`)
- ✅ MCP server deployed on Railway
- ✅ Monday.com API token configured

## 🚀 **Step-by-Step Integration**

### 1. **Import the Workflow**

1. Open n8n at `http://localhost:5678`
2. Click **"Import from file"**
3. Select `n8n-mcp-integration-workflow.json`
4. Click **"Import"**

### 2. **Activate the Workflow**

1. Click the **toggle switch** to activate (turn green)
2. Note the webhook URL: `http://localhost:5678/webhook/mcp-chatbot`

### 3. **Test the Integration**

```bash
# Run the test script
./test-n8n-mcp-integration.sh
```

## 🔧 **Workflow Components**

### **Node 1: MCP Chatbot Webhook**
- **Type:** Webhook
- **Path:** `mcp-chatbot`
- **Method:** POST
- **Purpose:** Receives natural language commands

### **Node 2: Parse Natural Language Command**
- **Type:** Code
- **Purpose:** Extracts command and parameters from user message
- **Supported Commands:**
  - `change email of task X to email@example.com`
  - `find task X`
  - `list all tasks`
  - `board info`

### **Node 3: Route Command**
- **Type:** IF
- **Purpose:** Routes valid commands to MCP server
- **Logic:** Checks if command is recognized

### **Node 4: Call MCP Server**
- **Type:** HTTP Request
- **URL:** `https://mcp-server-for-mondaycom-dify-automation-production.up.railway.app/`
- **Method:** POST
- **Purpose:** Sends command to MCP server

### **Node 5: Format Response**
- **Type:** Code
- **Purpose:** Formats MCP response for webhook reply

### **Node 6: Webhook Response**
- **Type:** Respond to Webhook
- **Purpose:** Sends response back to user

### **Node 7: Log Interaction**
- **Type:** Code
- **Purpose:** Logs all interactions for monitoring

## 🧪 **Testing Commands**

### **Test via curl:**
```bash
# Update email
curl -X POST http://localhost:5678/webhook/mcp-chatbot \
  -H "Content-Type: application/json" \
  -d '{"message": "change email of task 1 to test@example.com"}'

# Find task
curl -X POST http://localhost:5678/webhook/mcp-chatbot \
  -H "Content-Type: application/json" \
  -d '{"message": "find task 2"}'

# List all tasks
curl -X POST http://localhost:5678/webhook/mcp-chatbot \
  -H "Content-Type: application/json" \
  -d '{"message": "list all tasks"}'

# Board info
curl -X POST http://localhost:5678/webhook/mcp-chatbot \
  -H "Content-Type: application/json" \
  -d '{"message": "board info"}'
```

### **Expected Responses:**
```json
{
  "success": true,
  "message": "✅ Email updated for task \"1\" to test@example.com",
  "originalCommand": "change email of task 1 to test@example.com",
  "timestamp": "2025-08-17T18:30:00.000Z"
}
```

## 🔗 **Integration Options**

### **Option 1: Discord Bot**
```javascript
// Discord webhook integration
const webhook = new Discord.WebhookClient({ url: 'YOUR_WEBHOOK_URL' });

client.on('messageCreate', async (message) => {
  if (message.content.startsWith('!monday')) {
    const command = message.content.replace('!monday ', '');
    
    const response = await fetch('http://localhost:5678/webhook/mcp-chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: command })
    });
    
    const result = await response.json();
    message.reply(result.message);
  }
});
```

### **Option 2: Slack Bot**
```javascript
// Slack integration
app.post('/slack/events', async (req, res) => {
  const { text } = req.body.event;
  
  const response = await fetch('http://localhost:5678/webhook/mcp-chatbot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: text })
  });
  
  const result = await response.json();
  // Send response back to Slack
});
```

### **Option 3: Simple Web Interface**
```html
<!DOCTYPE html>
<html>
<head>
    <title>Monday.com Chatbot</title>
</head>
<body>
    <div id="chat">
        <div id="messages"></div>
        <input type="text" id="userInput" placeholder="Type: change email of task 1 to user@example.com">
        <button onclick="sendMessage()">Send</button>
    </div>
    
    <script>
    async function sendMessage() {
        const input = document.getElementById('userInput');
        const message = input.value;
        
        const response = await fetch('http://localhost:5678/webhook/mcp-chatbot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: message })
        });
        
        const result = await response.json();
        document.getElementById('messages').innerHTML += `<p><strong>You:</strong> ${message}</p>`;
        document.getElementById('messages').innerHTML += `<p><strong>Bot:</strong> ${result.message}</p>`;
        input.value = '';
    }
    </script>
</body>
</html>
```

## 📊 **Monitoring & Logging**

### **n8n Execution History**
- View all workflow executions in n8n
- Check success/failure rates
- Monitor response times

### **Custom Logging**
The workflow logs all interactions:
```javascript
console.log(`[${timestamp}] MCP Chatbot Interaction:`);
console.log(`  Original Message: ${data.originalCommand}`);
console.log(`  Response: ${data.message}`);
console.log(`  Success: ${data.success}`);
```

### **External Logging**
You can extend the logging node to send data to:
- Discord webhook
- Slack channel
- Database
- External monitoring service

## 🚀 **Production Deployment**

### **Environment Variables**
```bash
# n8n environment variables
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=secure_password
WEBHOOK_URL=https://your-domain.com/webhook/mcp-chatbot
```

### **Security Considerations**
- Use HTTPS in production
- Implement authentication
- Rate limiting
- Input validation

## 🎯 **Use Cases**

### **1. Team Chatbot**
- Slack/Discord integration
- Natural language commands
- Real-time Monday.com updates

### **2. Customer Support**
- Automated ticket updates
- Status inquiries
- Email management

### **3. Project Management**
- Task status updates
- Email assignments
- Board information queries

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **Webhook not responding**
   - Check if workflow is activated
   - Verify webhook URL
   - Check n8n logs

2. **MCP server errors**
   - Verify Railway deployment
   - Check Monday.com API token
   - Test MCP server directly

3. **Command not recognized**
   - Check natural language parsing
   - Verify command format
   - Review workflow logic

### **Debug Commands:**
```bash
# Test MCP server directly
curl -X POST https://mcp-server-for-mondaycom-dify-automation-production.up.railway.app/ \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "natural_language_command", "arguments": {"command": "list all tasks"}}}'

# Test n8n webhook
curl -X POST http://localhost:5678/webhook/mcp-chatbot \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}' | jq '.'
```

## 🎉 **Success!**

Your n8n + MCP integration is now ready for:
- ✅ Natural language processing
- ✅ Real-time Monday.com updates
- ✅ Multiple integration options
- ✅ Production deployment
- ✅ Client demonstrations

**Next:** Choose your preferred integration method and start building your chatbot! 🚀
