#!/bin/bash

echo "🚀 Railway MCP Server Complete Test"
echo "==================================="

RAILWAY_URL="https://mcp-server-for-mondaycom-dify-automation-production.up.railway.app"

echo "📡 1. Health Check:"
curl -s $RAILWAY_URL/health | jq '.'

echo ""
echo "🔧 2. MCP Tools List:"
curl -X POST $RAILWAY_URL/ \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}' \
  | jq '.result.tools[] | {name: .name, description: .description}'

echo ""
echo "📧 3. Testing Email Updates via MCP:"
echo "   Item 1:"
curl -X POST $RAILWAY_URL/ \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "id": 2, "method": "tools/call", "params": {"name": "monday_email_updater", "arguments": {"itemName": "1", "email": "hihijks@gmail.com"}}}' \
  | jq '.result.message'

echo "   Item 2:"
curl -X POST $RAILWAY_URL/ \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "id": 3, "method": "tools/call", "params": {"name": "monday_email_updater", "arguments": {"itemName": "2", "email": "hihijks@gmail.com"}}}' \
  | jq '.result.message'

echo "   Item 3:"
curl -X POST $RAILWAY_URL/ \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "id": 4, "method": "tools/call", "params": {"name": "monday_email_updater", "arguments": {"itemName": "3", "email": "hihijks@gmail.com"}}}' \
  | jq '.result.message'

echo ""
echo "🔍 4. Testing Search via MCP:"
curl -X POST $RAILWAY_URL/ \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "id": 5, "method": "tools/call", "params": {"name": "get_board_items_by_name", "arguments": {"boardId": 2056518483, "term": "1"}}}' \
  | jq '.result.items[] | {name: .name, status: .status}'

echo ""
echo "📝 5. Testing Column Update via MCP:"
curl -X POST $RAILWAY_URL/ \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "id": 6, "method": "tools/call", "params": {"name": "change_item_column_values", "arguments": {"boardId": 2056518483, "itemId": 123, "columnValues": "{\"email_mktp3awp\": \"hihijks@gmail.com\"}"}}}' \
  | jq '.result.message'

echo ""
echo "🎉 Railway MCP Server Test Completed!"
echo "📧 All items should now have email: hihijks@gmail.com"
echo "🌐 Railway URL: $RAILWAY_URL"
echo "📋 Note: This server is using mock data for demonstration"
