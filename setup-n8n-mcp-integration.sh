#!/bin/bash

echo "🚀 Setting up n8n + MCP Integration"
echo "==================================="

# Check if n8n is running
if ! curl -s http://localhost:5678 > /dev/null; then
    echo "❌ n8n is not running. Starting n8n..."
    docker-compose -f n8n-docker-compose.yml up n8n -d
    echo "⏳ Waiting for n8n to start..."
    sleep 15
fi

echo "✅ n8n is running on http://localhost:5678"

# Check if MCP server is accessible
echo ""
echo "🔍 Checking MCP server..."
MCP_RESPONSE=$(curl -s https://mcp-server-for-mondaycom-dify-automation-production.up.railway.app/health | jq -r '.message' 2>/dev/null)

if [[ "$MCP_RESPONSE" == *"Final Chatbot MCP Server"* ]]; then
    echo "✅ MCP server is accessible"
else
    echo "❌ MCP server is not accessible"
    echo "   Please check Railway deployment"
fi

echo ""
echo "📋 Next Steps:"
echo "1. Open n8n at: http://localhost:5678"
echo "2. Import workflow: n8n-mcp-integration-workflow.json"
echo "3. Activate the workflow (toggle to green)"
echo "4. Test with: ./test-n8n-mcp-integration.sh"
echo ""
echo "🔗 Useful URLs:"
echo "   n8n: http://localhost:5678"
echo "   MCP Server: https://mcp-server-for-mondaycom-dify-automation-production.up.railway.app/"
echo "   Webhook: http://localhost:5678/webhook/mcp-chatbot"
echo ""
echo "📚 Documentation:"
echo "   Integration Guide: n8n-mcp-integration-guide.md"
echo "   Test Script: test-n8n-mcp-integration.sh"
echo ""
echo "🎯 Ready to integrate your MCP server with n8n!"
