# 🚀 n8n + Monday.com Integration Setup Guide

## 📋 Overview

This guide shows how to set up n8n (a powerful automation platform) to integrate with Monday.com, providing a reliable alternative to the problematic Dify.ai MCP integration.

## 🎯 Why n8n?

- ✅ **Reliable**: No platform authentication issues
- ✅ **Visual**: Drag-and-drop workflow builder
- ✅ **Powerful**: 200+ integrations available
- ✅ **Self-hosted**: Full control over your data
- ✅ **Webhooks**: Real-time triggers from Monday.com

## 🚀 Quick Setup

### 1. Install n8n

#### Option A: Docker (Recommended)
```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

#### Option B: npm
```bash
npm install n8n -g
n8n start
```

#### Option C: n8n Cloud
Visit [n8n.cloud](https://n8n.cloud) for hosted solution

### 2. Access n8n
Open: `http://localhost:5678`

## 🔧 Monday.com Integration Setup

### Step 1: Create Monday.com API Token
1. Go to [Monday.com Developer](https://monday.com/developers)
2. Create new app
3. Get API token from app settings

### Step 2: Import Workflow
1. In n8n, click "Import from file"
2. Select `n8n-workflow.json`
3. Configure environment variables

### Step 3: Set Environment Variables
```bash
# In n8n settings or .env file
MONDAY_API_TOKEN=your_monday_api_token_here
```

## 📊 Workflow Components

### 1. Webhook Trigger
- **URL**: `https://your-n8n-instance.com/webhook/monday-webhook`
- **Method**: POST
- **Purpose**: Receives requests from external systems

### 2. Monday.com API Node
- **Endpoint**: Monday.com GraphQL API
- **Authentication**: API Token
- **Operations**: Update emails, search items, update columns

### 3. Response Node
- **Format**: JSON
- **Purpose**: Returns results to calling system

## 🎯 Use Cases

### 1. Email Updates
```json
POST /webhook/monday-webhook
{
  "boardId": 123,
  "itemId": 456,
  "email": "new@example.com"
}
```

### 2. Item Search
```json
POST /webhook/monday-webhook
{
  "operation": "search",
  "boardId": 123,
  "searchTerm": "project name"
}
```

### 3. Column Updates
```json
POST /webhook/monday-webhook
{
  "operation": "update_column",
  "boardId": 123,
  "itemId": 456,
  "columnId": "status",
  "columnValue": "done"
}
```

## 🔗 Integration with Dify.ai

### Option 1: Webhook Integration
1. In Dify.ai, create a webhook action
2. Point to your n8n webhook URL
3. Send data in the required format

### Option 2: HTTP Request Node
1. Add HTTP Request node in Dify.ai
2. Configure to call n8n webhook
3. Handle responses in Dify.ai

## 📝 Advanced Workflow Example

```json
{
  "name": "Advanced Monday.com Integration",
  "nodes": [
    {
      "name": "Webhook Trigger",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "httpMethod": "POST",
        "path": "monday-integration"
      }
    },
    {
      "name": "Switch Operation",
      "type": "n8n-nodes-base.switch",
      "parameters": {
        "rules": {
          "rules": [
            {
              "conditions": {
                "string": [
                  {
                    "value1": "={{ $json.operation }}",
                    "operation": "equals",
                    "value2": "update_email"
                  }
                ]
              }
            },
            {
              "conditions": {
                "string": [
                  {
                    "value1": "={{ $json.operation }}",
                    "operation": "equals",
                    "value2": "search_items"
                  }
                ]
              }
            }
          ]
        }
      }
    },
    {
      "name": "Monday.com API",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://api.monday.com/v2",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Authorization",
              "value": "={{ $env.MONDAY_API_TOKEN }}"
            }
          ]
        },
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "query",
              "value": "={{ $json.query }}"
            }
          ]
        }
      }
    },
    {
      "name": "Response",
      "type": "n8n-nodes-base.respondToWebhook",
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ { success: true, data: $json } }}"
      }
    }
  ]
}
```

## 🛠️ Testing

### 1. Test Webhook
```bash
curl -X POST http://localhost:5678/webhook/monday-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "boardId": 123,
    "itemId": 456,
    "email": "test@example.com"
  }'
```

### 2. Monitor Execution
- Check n8n execution history
- View detailed logs
- Debug step by step

## 🔒 Security

### 1. Authentication
- Use Monday.com API tokens
- Secure webhook endpoints
- Implement request validation

### 2. Environment Variables
- Store sensitive data in environment variables
- Use n8n's built-in credential management
- Never hardcode API tokens

## 📈 Monitoring

### 1. Execution History
- View all workflow executions
- Monitor success/failure rates
- Debug failed executions

### 2. Logs
- Detailed execution logs
- Error tracking
- Performance metrics

## 🚀 Deployment Options

### 1. Self-Hosted
- Docker container
- VPS deployment
- Local development

### 2. Cloud Hosted
- n8n.cloud
- Railway deployment
- Heroku deployment

### 3. Enterprise
- On-premises installation
- Custom domain setup
- Load balancing

## 📞 Support

### n8n Resources
- [n8n Documentation](https://docs.n8n.io/)
- [n8n Community](https://community.n8n.io/)
- [n8n GitHub](https://github.com/n8n-io/n8n)

### Monday.com Resources
- [Monday.com API Docs](https://monday.com/developers/v2)
- [Monday.com Community](https://community.monday.com/)

## 🎉 Benefits Over Dify.ai MCP

1. **Reliability**: No platform authentication issues
2. **Flexibility**: Visual workflow builder
3. **Scalability**: Handle high-volume requests
4. **Monitoring**: Built-in execution tracking
5. **Integration**: 200+ app integrations
6. **Control**: Self-hosted option available

## 📋 Next Steps

1. **Set up n8n instance**
2. **Import workflow**
3. **Configure Monday.com API token**
4. **Test webhook endpoints**
5. **Integrate with your application**
6. **Monitor and optimize**

This n8n solution provides a robust, reliable alternative to the problematic Dify.ai MCP integration while offering more flexibility and control over your Monday.com automation workflows. 