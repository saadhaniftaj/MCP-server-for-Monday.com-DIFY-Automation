#!/bin/bash

echo "🤖 Testing Full Monday.com Chatbot Integration"
echo "============================================="

# Check if n8n is running
if ! curl -s http://localhost:5678 > /dev/null; then
    echo "❌ n8n is not running. Please start n8n first:"
    echo "   docker-compose -f n8n-docker-compose.yml up n8n -d"
    exit 1
fi

echo "✅ n8n is running on http://localhost:5678"

# Test webhook URL
WEBHOOK_URL="http://localhost:5678/webhook/monday-chatbot-full"

echo ""
echo "🔧 Testing Full Chatbot Functionality..."

# Test 1: Help Command
echo ""
echo "📚 Test 1: Help Command"
curl -X POST $WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"message": "help"}' | jq '.message' | head -20

# Test 2: Update Email
echo ""
echo "📧 Test 2: Update Email"
curl -X POST $WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"message": "change email of task 1 to chatbot-test@example.com"}' | jq '.'

# Test 3: Find Task
echo ""
echo "🔍 Test 3: Find Task"
curl -X POST $WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"message": "find task 2"}' | jq '.'

# Test 4: List All Tasks
echo ""
echo "📋 Test 4: List All Tasks"
curl -X POST $WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"message": "list all tasks"}' | jq '.'

# Test 5: Board Info
echo ""
echo "📊 Test 5: Board Info"
curl -X POST $WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"message": "board info"}' | jq '.'

# Test 6: Unknown Command
echo ""
echo "❓ Test 6: Unknown Command"
curl -X POST $WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"message": "random unknown command"}' | jq '.message' | head -10

# Test 7: Different Email Update Format
echo ""
echo "📧 Test 7: Different Email Format"
curl -X POST $WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"message": "update email for task 3 to another-test@example.com"}' | jq '.'

# Test 8: Search with Different Format
echo ""
echo "🔍 Test 8: Search with Different Format"
curl -X POST $WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"message": "search for task 1"}' | jq '.'

echo ""
echo "🎉 Full chatbot tests completed!"
echo ""
echo "📋 Next steps:"
echo "1. Import full-chatbot-n8n-workflow.json into n8n"
echo "2. Activate the workflow (toggle to green)"
echo "3. Test with real Monday.com data"
echo ""
echo "🌐 Webhook URL: $WEBHOOK_URL"
echo "🚀 MCP Server: https://mcp-server-for-mondaycom-dify-automation-production.up.railway.app/"
echo ""
echo "💡 Available Commands:"
echo "• change email of task 1 to user@example.com"
echo "• find task 2"
echo "• list all tasks"
echo "• board info"
echo "• help"
