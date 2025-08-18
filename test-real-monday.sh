#!/bin/bash

# 🧪 Test Real Monday.com Server
# This script tests the server that actually connects to Monday.com API

echo "🧪 Testing Real Monday.com Server..."

# Check if server is running
if ! curl -s http://localhost:3000/health > /dev/null; then
    echo "❌ Server is not running. Please start it first:"
    echo "   node real-monday-server.js"
    exit 1
fi

echo "✅ Server is running on http://localhost:3000"

# Test health check
echo ""
echo "🔍 Test 1: Health Check"
curl -s http://localhost:3000/health | jq .

# Test email update
echo ""
echo "🔧 Test 2: Update Email to william@gmail.com"
curl -X POST http://localhost:3000/api/monday/update-email \
  -H "Content-Type: application/json" \
  -d '{
    "itemName": "Task",
    "email": "william@gmail.com",
    "boardId": 123,
    "itemId": 456
  }' | jq .

# Test search items
echo ""
echo "🔍 Test 3: Search Items"
curl -X POST http://localhost:3000/api/monday/search-items \
  -H "Content-Type: application/json" \
  -d '{
    "boardId": 123,
    "term": "Task"
  }' | jq .

# Test update column
echo ""
echo "📝 Test 4: Update Column"
curl -X POST http://localhost:3000/api/monday/update-column \
  -H "Content-Type: application/json" \
  -d '{
    "boardId": 123,
    "itemId": 456,
    "columnValues": {
      "Status": "Done"
    }
  }' | jq .

# Test board schema
echo ""
echo "📊 Test 5: Get Board Schema"
curl -s http://localhost:3000/api/monday/board-schema/123 | jq .

echo ""
echo "🎉 All tests completed!"
echo ""
echo "📋 Next steps:"
echo "1. Check if Monday.com API token is configured in .env"
echo "2. Verify the responses show real Monday.com data"
echo "3. Check your Monday.com board for actual updates"
echo ""
echo "🌐 Server URL: http://localhost:3000" 