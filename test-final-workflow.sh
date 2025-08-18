#!/bin/bash

echo "🧪 Testing Final Working n8n MCP Integration"
echo "==========================================="

# Check if n8n is running
if ! curl -s http://localhost:5678 > /dev/null; then
    echo "❌ n8n is not running. Please start n8n first:"
    echo "   docker-compose -f n8n-docker-compose.yml up n8n -d"
    exit 1
fi

echo "✅ n8n is running on http://localhost:5678"

# Test webhook URL
WEBHOOK_URL="http://localhost:5678/webhook/mcp-final"

echo ""
echo "🔧 Testing Final Working MCP Integration..."

# Test the webhook
echo ""
echo "📧 Test: Update Email via n8n"
curl -X POST $WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}' | jq '.'

echo ""
echo "🎉 Final workflow test completed!"
echo ""
echo "📋 Next steps:"
echo "1. Import final-working-n8n-workflow.json into n8n"
echo "2. Activate the workflow (toggle to green)"
echo "3. Test with real Monday.com data"
echo ""
echo "🌐 Webhook URL: $WEBHOOK_URL"
echo "🚀 MCP Server: https://mcp-server-for-mondaycom-dify-automation-production.up.railway.app/"
echo ""
echo "💡 This workflow will update task 1 email to test@example.com"
