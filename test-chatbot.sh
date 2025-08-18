#!/bin/bash

echo "🤖 Testing Monday.com Chatbot Integration"
echo "========================================"

# Check if n8n is running
if ! curl -s http://localhost:5678 > /dev/null; then
    echo "❌ n8n is not running. Please start n8n first:"
    echo "   docker-compose -f n8n-docker-compose.yml up n8n -d"
    exit 1
fi

echo "✅ n8n is running on http://localhost:5678"

# Test webhook URL
WEBHOOK_URL="http://localhost:5678/webhook/monday-chatbot"

echo ""
echo "🔧 Testing Chatbot with Natural Language Commands..."

# Test 1: Help command
echo ""
echo "❓ Test 1: Help Command"
curl -X POST $WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"message": "help"}' | jq '.message'

# Test 2: Update Email
echo ""
echo "📧 Test 2: Update Email"
curl -X POST $WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"message": "change email of task 1 to chatbot-test@gmail.com"}' | jq '.message'

# Test 3: Find Task
echo ""
echo "🔍 Test 3: Find Task"
curl -X POST $WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"message": "find task 2"}' | jq '.message'

# Test 4: List All Tasks
echo ""
echo "📋 Test 4: List All Tasks"
curl -X POST $WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"message": "list all tasks"}' | jq '.message'

# Test 5: Board Info
echo ""
echo "📊 Test 5: Board Info"
curl -X POST $WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"message": "board info"}' | jq '.message'

# Test 6: Unknown Command
echo ""
echo "❓ Test 6: Unknown Command"
curl -X POST $WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"message": "random unknown command"}' | jq '.message'

echo ""
echo "🎉 Chatbot tests completed!"
echo ""
echo "📋 Next steps:"
echo "1. Import chatbot-n8n-workflow.json into n8n"
echo "2. Activate the workflow (toggle to green)"
echo "3. Test with real Monday.com data"
echo ""
echo "🌐 Webhook URL: $WEBHOOK_URL"
echo "🚀 MCP Server: https://mcp-server-for-mondaycom-dify-automation-production.up.railway.app/"
echo ""
echo "💡 Try these commands:"
echo "• \"change email of task 1 to hi@gmail.com\""
echo "• \"find task 2\""
echo "• \"list all tasks\""
echo "• \"board info\""
echo "• \"help\""
