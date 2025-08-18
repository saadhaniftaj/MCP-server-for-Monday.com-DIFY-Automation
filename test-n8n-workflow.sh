#!/bin/bash

# 🧪 Test n8n Workflow for Monday.com Automation
# This script demonstrates how n8n can automate Monday.com updates

echo "🧪 Testing n8n Workflow for Monday.com Automation"
echo ""

# Check if services are running
echo "🔍 Checking services..."

if curl -s http://localhost:5678/healthz > /dev/null; then
    echo "✅ n8n is running on http://localhost:5678"
else
    echo "❌ n8n is not running"
    echo "   Start it with: docker run -it --rm --name n8n -p 5678:5678 n8nio/n8n"
    exit 1
fi

if curl -s http://localhost:3000/health > /dev/null; then
    echo "✅ Real Monday.com server is running on http://localhost:3000"
else
    echo "❌ Real Monday.com server is not running"
    echo "   Start it with: node real-monday-server-correct.js"
    exit 1
fi

echo ""
echo "📋 n8n Workflow Setup Instructions:"
echo ""
echo "1. Go to http://localhost:5678"
echo "2. Import workflow: n8n-real-monday-workflow.json"
echo "3. Activate workflow (toggle switch)"
echo "4. Copy webhook URL from Webhook Trigger node"
echo ""
echo "🔧 Once workflow is active, test with these commands:"
echo ""

# Example commands
echo "📧 Update Email via n8n:"
echo "curl -X POST http://localhost:5678/webhook/YOUR_WEBHOOK_ID \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{"
echo "    \"operation\": \"update_email\","
echo "    \"itemName\": \"3\","
echo "    \"email\": \"ss@gmail.com\","
echo "    \"boardId\": 2056518483,"
echo "    \"itemId\": 2056518493"
echo "  }'"
echo ""

echo "🔍 Search Items via n8n:"
echo "curl -X POST http://localhost:5678/webhook/YOUR_WEBHOOK_ID \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{"
echo "    \"operation\": \"search_items\","
echo "    \"boardId\": 2056518483,"
echo "    \"term\": \"3\""
echo "  }'"
echo ""

echo "🎯 Benefits of n8n Automation:"
echo "✅ Visual workflow builder"
echo "✅ Error handling and retries"
echo "✅ Execution monitoring"
echo "✅ Can be scheduled automatically"
echo "✅ Integrates with 200+ services"
echo "✅ Webhook triggers from anywhere"
echo ""

echo "📊 Current Board Status:"
curl -s http://localhost:3000/api/monday/board-items/2056518483 | \
  jq '.items[] | {name: .name, id: .id, email: (.column_values[] | select(.id == "email_mktp3awp") | .text)}'

echo ""
echo "🎉 Ready to automate Monday.com updates via n8n!" 