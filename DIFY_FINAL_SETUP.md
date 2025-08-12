# 🚀 Dify.ai MCP Server Setup - FINAL GUIDE

## ✅ **MCP Server Status: READY**

Your MCP server is running and tested successfully! Here's how to configure it in Dify.ai:

## 📋 **Step-by-Step Dify.ai Configuration**

### 1. **Go to Dify.ai**
- Visit: https://cloud.dify.ai/
- Sign in to your account
- Go to your agent (or create a new one)

### 2. **Add MCP Server Tool**
- Click **"Add Tool"**
- Select **"MCP Server"** (NOT HTTP API)
- Configure with these exact settings:

### 3. **MCP Server Configuration**

**Command:**
```
node simple-mcp-server.js
```

**Working Directory:**
```
/Users/applestore/Desktop/aws-fiverr/ww/mcp rampup/monday:defy POC
```

**Environment Variables:**
```
MONDAY_API_TOKEN=eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjU0ODY3ODQ5MCwiYWFpIjoxMSwidWlkIjo3OTc1MTA4OSwiaWFkIjoiMjAyNS0wOC0xMFQxODozNjowMS4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MzA3NjgxOTgsInJnbiI6ImFwc2UyIn0.vJ3fYdST1pVr_puV6NzIH54UFSH77NiOFoxu0hFCqRs
MONDAY_BOARD_ID=2056518483
EMAIL_COLUMN_ID=email_mktp3awp
```

### 4. **Save and Test**

- Click **"Save"**
- The MCP server should connect successfully
- No authentication errors should appear

## 🧪 **Test Commands**

Try these natural language commands in your Dify.ai agent:

1. **Find an item:**
   ```
   Find item named 1
   ```

2. **Update email:**
   ```
   Update email for item 1 to test@example.com
   ```

3. **Get board info:**
   ```
   Get board schema
   ```

## 🔧 **Available MCP Tools**

Your MCP server provides these tools:

1. **`get_board_items_by_name`** - Find items by name
2. **`change_item_column_values`** - Update item columns  
3. **`get_board_schema`** - Get board structure

## ✅ **Verification**

- ✅ MCP server is running locally
- ✅ JSON-RPC protocol working correctly
- ✅ No authentication required
- ✅ Monday.com API integration ready
- ✅ Environment variables configured

## 🚨 **Troubleshooting**

If you get "Session terminated by server":
- Make sure you selected **"MCP Server"** tool type (not HTTP API)
- Verify the working directory path is correct
- Check that all environment variables are set

If you get OAuth errors:
- The MCP server has NO authentication - this is correct
- Dify.ai should connect directly without OAuth

## 🎉 **Success Indicators**

When working correctly:
- Dify.ai should connect to the MCP server without errors
- You should see the available tools in your agent
- Natural language commands should work
- Monday.com data should be accessible

---

**Your MCP server is ready! Configure it in Dify.ai and start testing natural language commands.** 🚀 