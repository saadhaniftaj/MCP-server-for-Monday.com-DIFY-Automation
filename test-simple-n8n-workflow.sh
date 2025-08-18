#!/bin/bash

echo "🧪 Testing Simple n8n MCP Integration"
echo "===================================="

# Check if n8n is running
if ! curl -s http://localhost:5678 > /dev/null; then
    echo "❌ n8n is not running. Please start n8n first:"
    echo "   docker-compose -f n8n-docker-compose.yml up n8n -d"
    exit 1
fi

echo "✅ n8n is running on http://localhost:5678"

# Test webhook URL
WEBHOOK_URL="http://localhost:5678/webhook/mcp-simple"

echo ""
echo "🔧 Testing Simple MCP Integration..."

# Test 1: Update Email
echo ""
echo "📧 Test 1: Update Email"
curl -X POST $WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"message": "change email of task 1 to simple-test@example.com"}' | jq '.'

# Test 2: Find Task
echo ""
echo "🔍 Test 2: Find Task"
curl -X POST $WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"message": "find task 2"}' | jq '.'

# Test 3: List All Tasks
echo ""
echo "📋 Test 3: List All Tasks"
curl -X POST $WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"message": "list all tasks"}' | jq '.'

# Test 4: Board Info
echo ""
echo "📊 Test 4: Board Info"
curl -X POST $WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"message": "board info"}' | jq '.'

echo ""
echo "🎉 Simple workflow tests completed!"
echo ""
echo "📋 Next steps:"
echo "1. Import simple-n8n-mcp-workflow.json into n8n"
echo "2. Activate the workflow (toggle to green)"
echo "3. Test with real Monday.com data"
echo ""
echo "🌐 Webhook URL: $WEBHOOK_URL"
echo "🚀 MCP Server: https://mcp-server-for-mondaycom-dify-automation-production.up.railway.app/"
