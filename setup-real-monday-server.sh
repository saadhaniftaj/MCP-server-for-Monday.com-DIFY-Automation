#!/bin/bash

# 🚀 Setup Real Monday.com Server
# This script sets up a server that actually connects to Monday.com API

echo "🚀 Setting up Real Monday.com Server..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Monday.com API Configuration
MONDAY_API_TOKEN=your_monday_api_token_here

# Server Configuration
PORT=3000
EOF
    echo "✅ .env file created"
    echo "⚠️  Please add your Monday.com API token to .env file"
else
    echo "✅ .env file already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install express cors axios dotenv

# Check if Monday.com API token is configured
if grep -q "your_monday_api_token_here" .env; then
    echo ""
    echo "⚠️  IMPORTANT: You need to configure your Monday.com API token!"
    echo ""
    echo "📋 Steps to get Monday.com API token:"
    echo "1. Go to https://monday.com/developers"
    echo "2. Sign in to your Monday.com account"
    echo "3. Create a new app"
    echo "4. Copy the API token from app settings"
    echo "5. Replace 'your_monday_api_token_here' in .env file"
    echo ""
    echo "🔧 Example .env file:"
    echo "MONDAY_API_TOKEN=eyJhbGciOiJIUzI1NiJ9..."
    echo ""
else
    echo "✅ Monday.com API token appears to be configured"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "🚀 To start the server:"
echo "   node real-monday-server.js"
echo ""
echo "🧪 To test the server:"
echo "   curl -X POST http://localhost:3000/api/monday/update-email \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -d '{\"itemName\": \"Task\", \"email\": \"william@gmail.com\"}'"
echo ""
echo "🌐 Health check:"
echo "   curl http://localhost:3000/health" 