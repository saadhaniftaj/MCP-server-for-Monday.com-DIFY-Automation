#!/bin/bash

# 🧪 Test n8n Monday.com Integration
# This script tests the n8n webhook endpoints

echo "🧪 Testing n8n Monday.com Integration..."

# Check if n8n is running
if ! curl -s http://localhost:5678 > /dev/null; then
    echo "❌ n8n is not running. Please start n8n first:"
    echo "   ./setup-n8n.sh"
    exit 1
fi

echo "✅ n8n is running on http://localhost:5678"

# Test webhook endpoint
echo ""
echo "📡 Testing webhook endpoint..."

# Test 1: Update email
echo "🔧 Test 1: Update Email"
curl -X POST http://localhost:5678/webhook/monday-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "boardId": 123,
    "itemId": 456,
    "email": "test@example.com"
  }' | jq .

echo ""
echo "✅ Test 1 completed"

# Test 2: Search items
echo ""
echo "🔍 Test 2: Search Items"
curl -X POST http://localhost:5678/webhook/monday-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "search",
    "boardId": 123,
    "searchTerm": "test project"
  }' | jq .

echo ""
echo "✅ Test 2 completed"

# Test 3: Update column
echo ""
echo "📝 Test 3: Update Column"
curl -X POST http://localhost:5678/webhook/monday-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "update_column",
    "boardId": 123,
    "itemId": 456,
    "columnId": "status",
    "columnValue": "done"
  }' | jq .

echo ""
echo "✅ Test 3 completed"

echo ""
echo "🎉 All tests completed!"
echo ""
echo "📋 Next steps:"
echo "1. Configure your Monday.com API token in n8n"
echo "2. Update the webhook URL in your application"
echo "3. Test with real Monday.com data"
echo ""
echo "📚 For more information, see: n8n-setup-guide.md" 