#!/bin/bash

# 🚀 n8n + Monday.com Integration Setup Script
# This script sets up n8n with Docker for Monday.com automation

echo "🚀 Setting up n8n for Monday.com Integration..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "✅ Docker is available and running"

# Create n8n data directory
echo "📁 Creating n8n data directory..."
mkdir -p ~/.n8n

# Set environment variables
export N8N_BASIC_AUTH_ACTIVE=true
export N8N_BASIC_AUTH_USER=admin
export N8N_BASIC_AUTH_PASSWORD=admin123
export WEBHOOK_URL=https://your-domain.com
export GENERIC_TIMEZONE=UTC

echo "🔧 Environment variables set:"
echo "   - Username: admin"
echo "   - Password: admin123"
echo "   - Webhook URL: $WEBHOOK_URL"

# Pull latest n8n image
echo "📦 Pulling latest n8n Docker image..."
docker pull n8nio/n8n:latest

# Stop existing n8n container if running
echo "🛑 Stopping existing n8n container..."
docker stop n8n 2>/dev/null || true
docker rm n8n 2>/dev/null || true

# Start n8n container
echo "🚀 Starting n8n container..."
docker run -d \
  --name n8n \
  --restart unless-stopped \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  -e N8N_BASIC_AUTH_ACTIVE=true \
  -e N8N_BASIC_AUTH_USER=admin \
  -e N8N_BASIC_AUTH_PASSWORD=admin123 \
  -e WEBHOOK_URL=$WEBHOOK_URL \
  -e GENERIC_TIMEZONE=UTC \
  n8nio/n8n:latest

# Wait for n8n to start
echo "⏳ Waiting for n8n to start..."
sleep 10

# Check if n8n is running
if docker ps | grep -q n8n; then
    echo "✅ n8n is running successfully!"
    echo ""
    echo "🌐 Access n8n at: http://localhost:5678"
    echo "👤 Username: admin"
    echo "🔑 Password: admin123"
    echo ""
    echo "📋 Next steps:"
    echo "1. Open http://localhost:5678 in your browser"
    echo "2. Import the n8n-workflow.json file"
    echo "3. Configure your Monday.com API token"
    echo "4. Test the webhook endpoints"
    echo ""
    echo "📚 Documentation: n8n-setup-guide.md"
else
    echo "❌ Failed to start n8n. Check Docker logs:"
    docker logs n8n
    exit 1
fi

echo ""
echo "🎉 n8n setup complete! Happy automating! 🚀" 