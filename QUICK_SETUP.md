# 🚀 Quick Setup Guide - Monday.com MCP Server

## 🎯 **Option 1: Automated Setup (Recommended)**

Run the automated setup script that handles everything:

```bash
npm run auto-setup
```

This will:
- ✅ Check your environment variables
- ✅ Verify all dependencies
- ✅ Test the MCP server
- ✅ Generate Dify.ai configuration
- ✅ Provide step-by-step instructions

## 🎯 **Option 2: Manual Setup**

### **Step 1: Environment Setup**
Make sure your `.env` file has:
```env
MONDAY_API_TOKEN=eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjU0ODY3ODQ5MCwiYWFpIjoxMSwidWlkIjo3OTc1MTA4OSwiaWFkIjoiMjAyNS0wOC0xMFQxODozNjowMS4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MzA3NjgxOTgsInJnbiI6ImFwc2UyIn0.vJ3fYdST1pVr_puV6NzIH54UFSH77NiOFoxu0hFCqRs
MONDAY_BOARD_ID=2056518483
EMAIL_COLUMN_ID=email_mktp3awp
```

### **Step 2: Install Dependencies**
```bash
npm install
```

### **Step 3: Test MCP Server**
```bash
npm run mcp-server
```

### **Step 4: Dify.ai Configuration**

#### **Copy & Paste Configuration:**
```json
{
  "type": "mcp_server",
  "name": "monday_mcp_server",
  "config": {
    "command": "node simple-mcp-server.js",
    "working_directory": "/Users/applestore/Desktop/aws-fiverr/ww/mcp rampup/monday:defy POC",
    "env": {
      "MONDAY_API_TOKEN": "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjU0ODY3ODQ5MCwiYWFpIjoxMSwidWlkIjo3OTc1MTA4OSwiaWFkIjoiMjAyNS0wOC0xMFQxODozNjowMS4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MzA3NjgxOTgsInJnbiI6ImFwc2UyIn0.vJ3fYdST1pVr_puV6NzIH54UFSH77NiOFoxu0hFCqRs",
      "MONDAY_BOARD_ID": "2056518483",
      "EMAIL_COLUMN_ID": "email_mktp3awp"
    }
  }
}
```

#### **Manual Steps:**
1. Go to your Dify.ai agent
2. Click "Add Tool"
3. Select "MCP Server"
4. Set Command: `node simple-mcp-server.js`
5. Set Working Directory: `/Users/applestore/Desktop/aws-fiverr/ww/mcp rampup/monday:defy POC`
6. Add Environment Variables (see above)

## 🧪 **Test Commands**

Once configured, test with these commands:

- `"Find item named 1"`
- `"Update email for item 1 to test@example.com"`
- `"Get board schema"`

## 📋 **Available Files**

- `automated-setup.js` - Automated setup script
- `simple-mcp-server.js` - MCP server implementation
- `dify-mcp-automation.json` - Dify.ai import configuration
- `DIFY_MCP_SETUP.md` - Detailed setup guide

## 🎉 **Success Indicators**

✅ MCP server responds to initialize request
✅ Tools list shows 3 available tools
✅ Dify.ai can connect without OAuth errors
✅ Natural language commands work

## 🆘 **Troubleshooting**

### **OAuth Error:**
- Use MCP Server tool (not HTTP API)
- No authentication required for MCP protocol

### **Connection Failed:**
- Check working directory path
- Verify environment variables
- Run `npm run auto-setup` for diagnostics

### **Tools Not Working:**
- Check Monday.com API token
- Verify board ID and column IDs
- Test with `npm run mcp-server`

## 📞 **Support**

If you encounter issues:
1. Run `npm run auto-setup` for diagnostics
2. Check the detailed guide: `DIFY_MCP_SETUP.md`
3. Verify your Monday.com API credentials 