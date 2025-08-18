#!/bin/bash

# 🧪 Test n8n Automation with Real Monday.com Server
# This script tests if n8n is working with the real Monday.com integration

echo "🧪 Testing n8n Automation with Real Monday.com Server..."
echo ""

# Check if n8n is running
if ! curl -s http://localhost:5678/healthz > /dev/null; then
    echo "❌ n8n is not running. Please start it first:"
    echo "   docker run -it --rm --name n8n -p 5678:5678 n8nio/n8n"
    exit 1
fi

echo "✅ n8n is running on http://localhost:5678"
echo ""

# Check if real Monday.com server is running
if ! curl -s http://localhost:3000/health > /dev/null; then
    echo "❌ Real Monday.com server is not running. Please start it first:"
    echo "   node real-monday-server-correct.js"
    exit 1
fi

echo "✅ Real Monday.com server is running on http://localhost:3000"
echo ""

# Test 1: Test n8n webhook endpoint
echo "🔧 Test 1: Testing n8n webhook endpoint"
echo "Sending request to: http://localhost:5678/webhook/monday-real"
echo ""

curl -X POST http://localhost:5678/webhook/monday-real \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "update_email",
    "itemName": "2",
    "email": "william@gmail.com",
    "boardId": 2056518483,
    "itemId": 2056518492
  }' | jq .

echo ""
echo "📋 Instructions for n8n setup:"
echo ""
echo "1. Go to http://localhost:5678"
echo "2. Import the workflow: n8n-real-monday-workflow.json"
echo "3. Activate the workflow (toggle switch)"
echo "4. Copy the webhook URL"
echo "5. Test with the curl command above"
echo ""
echo "🎯 The n8n automation should now work with the real Monday.com server!" 