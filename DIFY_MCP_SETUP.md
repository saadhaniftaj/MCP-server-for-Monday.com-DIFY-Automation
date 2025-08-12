# 🔧 Dify.ai MCP Setup - Avoiding OAuth Issues

## ❌ **The Problem**
Dify.ai automatically tries to use OAuth authentication when connecting to MCP servers, which causes the error:
```
HTTP 401 trying to load well-known OAuth metadata
```

## ✅ **The Solution**
Use the HTTP API approach with proper configuration to avoid OAuth entirely.

## 🚀 **Step-by-Step Setup**

### **Step 1: Ensure Server is Running**
Your server is already running at: `https://monday-dify-mcp.loca.lt`

### **Step 2: Configure Dify.ai HTTP API Tool**

#### **2.1 Remove Any Existing MCP Server Configuration**
1. Go to your Dify.ai agent "MCP Monday.com Demo"
2. Remove any existing MCP server or HTTP API tool configurations
3. Start fresh

#### **2.2 Add HTTP API Tool**
1. Click **"Add Tool"**
2. Select **"HTTP API Tool"** (NOT MCP Server)
3. Configure as follows:

**Basic Settings:**
- **Tool Name**: `monday_mcp_api`
- **Base URL**: `https://monday-dify-mcp.loca.lt`
- **Authentication Type**: `API Key`
- **Header Name**: `x-api-key`
- **API Key Value**: `monday-dify-mcp-key-2024`

### **Step 3: Add Endpoints**

#### **Endpoint 1: Health Check**
- **Method**: `GET`
- **Path**: `/health`
- **Description**: `Check if the Monday.com MCP server is running`
- **Headers**: (leave empty - no auth required)

#### **Endpoint 2: Process Command (Main)**
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

### **Step 4: Test Configuration**

#### **Test Command:**
```
Update email for item 1 to test@example.com
```

#### **Expected Flow:**
1. Dify.ai parses the natural language command
2. Calls `/process-command` endpoint with API key
3. Server processes the command and updates Monday.com
4. Returns success response

### **Step 5: Verify It Works**

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

## 🔍 **Why This Works**

1. **No OAuth**: HTTP API tools don't use OAuth by default
2. **API Key Auth**: Simple and secure
3. **Same Functionality**: All MCP features available via HTTP endpoints
4. **Dify.ai Compatible**: Works perfectly with Dify.ai's HTTP API tool system

## 📋 **Quick Reference**

**Server URL**: `https://monday-dify-mcp.loca.lt`
**API Key**: `monday-dify-mcp-key-2024`
**Header**: `x-api-key`
**Tool Type**: HTTP API Tool (NOT MCP Server)

## 🎯 **Next Steps**

1. Configure the HTTP API Tool in Dify.ai with these exact settings
2. Test with natural language commands
3. Create your Loom video demo
4. Document the successful integration

This approach gives you all the MCP functionality without the OAuth authentication issues! 