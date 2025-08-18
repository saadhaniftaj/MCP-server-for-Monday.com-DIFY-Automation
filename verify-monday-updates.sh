#!/bin/bash

echo "🔍 Verifying Monday.com Board Updates"
echo "====================================="

# Start the local server
echo "📡 Starting local server..."
node railway-mcp-server.js &
SERVER_PID=$!

# Wait for server to start
sleep 3

echo ""
echo "✅ Checking all items in your Monday.com board..."

# Check Item 1
echo "📧 Item 1:"
curl -X POST http://localhost:3000/api/monday/search-items \
  -H "Content-Type: application/json" \
  -d '{"boardId": 2056518483, "term": "1"}' \
  | jq '.items[0].column_values[] | select(.id == "email_mktp3awp") | {email: .text}'

# Check Item 2
echo "📧 Item 2:"
curl -X POST http://localhost:3000/api/monday/search-items \
  -H "Content-Type: application/json" \
  -d '{"boardId": 2056518483, "term": "2"}' \
  | jq '.items[0].column_values[] | select(.id == "email_mktp3awp") | {email: .text}'

# Check Item 3
echo "📧 Item 3:"
curl -X POST http://localhost:3000/api/monday/search-items \
  -H "Content-Type: application/json" \
  -d '{"boardId": 2056518483, "term": "3"}' \
  | jq '.items[0].column_values[] | select(.id == "email_mktp3awp") | {email: .text}'

echo ""
echo "🎉 Verification completed!"
echo "📧 All items should now have email: dinalti@gmail.com"
echo "🌐 Check your Monday.com board to see the changes!"

# Stop the server
echo ""
echo "🛑 Stopping server..."
kill $SERVER_PID
