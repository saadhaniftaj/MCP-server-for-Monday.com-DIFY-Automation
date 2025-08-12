# 🔧 Dify.ai Setup Guide - API Key Authentication

## ❌ **Problem Solved**
The error `HTTP 401 trying to load well-known OAuth metadata` occurs because Dify.ai was trying to use OAuth authentication, but our server uses API key authentication.

## ✅ **Solution: Configure as HTTP API Tool with API Key**

### **Step 1: Remove Any Existing MCP Server Configuration**
1. Go to your Dify.ai agent "MCP Monday.com Demo"
2. Remove any MCP server configuration
3. We'll add it as an HTTP API Tool instead

### **Step 2: Add HTTP API Tool**
1. In your Dify.ai agent settings, click **"Add Tool"**
2. Select **"HTTP API Tool"** (NOT MCP Server)
3. Configure as follows:

#### **Basic Configuration:**
- **Tool Name**: `monday_mcp_api`
- **Base URL**: `https://monday-dify-mcp.loca.lt`
- **Authentication Type**: `API Key`
- **Header Name**: `x-api-key`
- **API Key**: `monday-dify-mcp-key-2024`

### **Step 3: Add Endpoints**

#### **Endpoint 1: Health Check**
- **Method**: `GET`
- **Path**: `/health`
- **Description**: `Check if the Monday.com MCP server is running`
- **Headers**: (leave empty - no auth required)

#### **Endpoint 2: Process Command**
- **Method**: `POST`
- **Path**: `/process-command`
- **Description**: `Process natural language commands like 'Update email for item [name] to [email]'`
- **Headers**: 
  - `Content-Type`: `application/json`
  - `x-api-key`: `monday-dify-mcp-key-2024`
- **Parameters**:
  - `command` (string, required): Natural language command
  - `boardId` (number, optional): Monday.com board ID

#### **Endpoint 3: Get Item**
- **Method**: `POST`
- **Path**: `/get-item`
- **Description**: `Find an item by name on Monday.com board`
- **Headers**:
  - `Content-Type`: `application/json`
  - `x-api-key`: `monday-dify-mcp-key-2024`
- **Parameters**:
  - `boardId` (number, required): Monday.com board ID
  - `itemName` (string, required): Name of the item to search for

#### **Endpoint 4: Update Email**
- **Method**: `POST`
- **Path**: `/update-email`
- **Description**: `Update email field for a specific item`
- **Headers**:
  - `Content-Type`: `application/json`
  - `x-api-key`: `monday-dify-mcp-key-2024`
- **Parameters**:
  - `boardId` (number, required): Monday.com board ID
  - `itemId` (number, required): Item ID to update
  - `email` (string, required): New email address
  - `emailColumnId` (string, optional): Email column ID

#### **Endpoint 5: Get Board Schema**
- **Method**: `GET`
- **Path**: `/board-schema/{boardId}`
- **Description**: `Get board schema including columns and groups`
- **Headers**:
  - `x-api-key`: `monday-dify-mcp-key-2024`
- **Parameters**:
  - `boardId` (number, required): Monday.com board ID

### **Step 4: Test the Configuration**

#### **Test Command:**
```
Update email for item 1 to test@example.com
```

#### **Expected Response:**
The agent should:
1. Parse the natural language command
2. Call the `/process-command` endpoint
3. Return a success message

### **Step 5: Verify Authentication**

#### **Test Without API Key (Should Fail):**
```bash
curl -X POST https://monday-dify-mcp.loca.lt/process-command \
  -H "Content-Type: application/json" \
  -d '{"command": "Update email for item 1 to test@example.com"}'
```

#### **Test With API Key (Should Succeed):**
```bash
curl -X POST https://monday-dify-mcp.loca.lt/process-command \
  -H "Content-Type: application/json" \
  -H "x-api-key: monday-dify-mcp-key-2024" \
  -d '{"command": "Update email for item 1 to test@example.com"}'
```

## 🔍 **Troubleshooting**

### **If you still get OAuth errors:**
1. Make sure you're adding an **HTTP API Tool**, not an MCP Server
2. Verify the authentication type is set to **API Key**
3. Check that the header name is exactly `x-api-key`
4. Ensure the API key value is exactly `monday-dify-mcp-key-2024`

### **If endpoints don't work:**
1. Test the server directly with curl commands above
2. Check that the server is running: `curl https://monday-dify-mcp.loca.lt/health`
3. Verify your `.env` file has the correct `API_KEY` value

### **If Dify.ai can't connect:**
1. Make sure the localtunnel URL is still active
2. Check that the server is running in the background
3. Try restarting the server if needed

## 📋 **Quick Reference**

**Server URL**: `https://monday-dify-mcp.loca.lt`
**API Key**: `monday-dify-mcp-key-2024`
**Header Name**: `x-api-key`
**Tool Type**: HTTP API Tool (NOT MCP Server)

## 🎯 **Next Steps**
1. Configure the HTTP API Tool in Dify.ai
2. Test with natural language commands
3. Create your Loom video demo
4. Document any issues for further troubleshooting 