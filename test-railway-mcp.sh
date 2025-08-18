#!/bin/bash

echo "🚀 Testing Railway MCP Server with Real Monday.com Integration"
echo "=============================================================="

RAILWAY_URL="https://mcp-server-for-mondaycom-dify-automation-production.up.railway.app"

echo "📡 Checking Railway server status..."
curl -s $RAILWAY_URL/health | jq '.'

echo ""
echo "🔧 Testing MCP tools/list endpoint..."
curl -X POST $RAILWAY_URL/ \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}' \
  | jq '.'

echo ""
echo "📧 Testing MCP update_email tool for item '1'..."
curl -X POST $RAILWAY_URL/ \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "update_email",
      "arguments": {
        "itemName": "1",
        "email": "saud@gmail.com",
        "boardId": 2056518483,
        "itemId": 2056518491
      }
    }
  }' \
  | jq '.'

echo ""
echo "🔍 Testing MCP search_items tool..."
curl -X POST $RAILWAY_URL/ \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "search_items",
      "arguments": {
        "boardId": 2056518483,
        "term": "1"
      }
    }
  }' \
  | jq '.'

echo ""
echo "🎉 Railway MCP Server test completed!"
echo "📧 All items should now have email: saud@gmail.com"
echo "🌐 Check your Monday.com board to verify the changes!" 