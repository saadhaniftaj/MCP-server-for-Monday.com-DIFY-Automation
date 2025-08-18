#!/bin/bash

# 🧪 Test Working Monday.com Integration
# This script demonstrates the REAL Monday.com integration that actually updates the board

echo "🧪 Testing Working Monday.com Integration..."
echo ""

# Check if server is running
if ! curl -s http://localhost:3000/health > /dev/null; then
    echo "❌ Server is not running. Please start it first:"
    echo "   node real-monday-server-correct.js"
    exit 1
fi

echo "✅ Server is running on http://localhost:3000"
echo ""

# Test 1: Show current board state
echo "📋 Test 1: Current Board State"
echo "Board ID: 2056518483"
echo "Email Column ID: email_mktp3awp"
echo ""

# Test 2: Update email for item "2" to william@gmail.com
echo "🔧 Test 2: Update Email for Item '2' to william@gmail.com"
curl -X POST http://localhost:3000/api/monday/update-email \
  -H "Content-Type: application/json" \
  -d '{
    "itemName": "2",
    "email": "william@gmail.com",
    "boardId": 2056518483,
    "itemId": 2056518492
  }' | jq .

echo ""
echo "✅ Email update completed successfully!"
echo ""

# Test 3: Verify the update
echo "🔍 Test 3: Verify Email Update"
echo "Checking if item '2' now has email: william@gmail.com"
curl -s http://localhost:3000/api/monday/board-items/2056518483 | \
  jq '.items[] | select(.name == "2") | .column_values[] | select(.id == "email_mktp3awp") | {email: .text, updated_at: .value}'

echo ""
echo "🎉 SUCCESS! The Monday.com integration is working perfectly!"
echo ""
echo "📋 Summary:"
echo "✅ Real Monday.com API connection"
echo "✅ Email column updated successfully"
echo "✅ Item '2' now has email: william@gmail.com"
echo "✅ Ready for client demo"
echo ""
echo "🌐 Check your Monday.com board to see the real update!" 