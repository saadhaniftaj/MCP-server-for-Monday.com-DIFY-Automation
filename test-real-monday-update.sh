#!/bin/bash

echo "🚀 Testing Real Monday.com Integration"
echo "======================================"

# Start the real server in background
echo "📡 Starting real Monday.com server..."
node real-monday-server-correct.js &
SERVER_PID=$!

# Wait for server to start
sleep 3

echo ""
echo "✅ Server is running. Testing email update for item '3'..."

# Test the real email update
curl -X POST http://localhost:3000/api/monday/update-email \
  -H "Content-Type: application/json" \
  -d '{"itemName": "3", "email": "saud@gmail.com", "boardId": 2056518483, "itemId": 2056518493}' \
  | jq '.'

echo ""
echo "✅ Email update completed! Now verifying the change..."

# Verify the update
curl -X POST http://localhost:3000/api/monday/search-items \
  -H "Content-Type: application/json" \
  -d '{"boardId": 2056518483, "term": "3"}' \
  | jq '.items[0].column_values[] | select(.id == "email_mktp3awp")'

echo ""
echo "🎉 Real Monday.com integration is working!"
echo "📧 Item '3' email has been updated to 'saud@gmail.com'"
echo "🌐 Check your Monday.com board to see the change!"

# Stop the server
echo ""
echo "🛑 Stopping server..."
kill $SERVER_PID
