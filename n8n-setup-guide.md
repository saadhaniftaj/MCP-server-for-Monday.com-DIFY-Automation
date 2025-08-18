# 🚀 n8n + Monday.com Automation Setup Guide

## **Current Status:**
- ✅ **Real Monday.com server** is working (updates emails successfully)
- ❌ **n8n workflow** needs to be imported and activated

## **Step-by-Step Setup:**

### **Step 1: Access n8n**
1. **Open browser**: http://localhost:5678
2. **Login** to n8n interface

### **Step 2: Import the Workflow**
1. **Click "Import from file"** (top-right)
2. **Select**: `n8n-real-monday-workflow.json`
3. **Click "Import"**

### **Step 3: Activate the Workflow**
1. **Find the workflow** in your list
2. **Click the toggle switch** in top-right corner
3. **Turn it GREEN** (activated)

### **Step 4: Get the Webhook URL**
1. **Click on the workflow** to open it
2. **Click on the Webhook Trigger** node
3. **Copy the webhook URL** (e.g., `http://localhost:5678/webhook/abc123`)

### **Step 5: Test the Automation**

#### **Test Email Update via n8n:**
```bash
curl -X POST http://localhost:5678/webhook/YOUR_WEBHOOK_ID \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "update_email",
    "itemName": "3",
    "email": "ss@gmail.com",
    "boardId": 2056518483,
    "itemId": 2056518493
  }'
```

#### **Test Search Items via n8n:**
```bash
curl -X POST http://localhost:5678/webhook/YOUR_WEBHOOK_ID \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "search_items",
    "boardId": 2056518483,
    "term": "3"
  }'
```

## **What the n8n Workflow Does:**

### **Email Update Flow:**
1. **Webhook Trigger** receives request
2. **Check Operation** determines it's "update_email"
3. **HTTP Request** calls real Monday.com server
4. **Response** returns success/failure

### **Search Items Flow:**
1. **Webhook Trigger** receives request
2. **Check Operation** determines it's "search_items"
3. **HTTP Request** searches Monday.com board
4. **Response** returns found items

## **Benefits of n8n Automation:**

✅ **Visual workflow** - Easy to understand and modify  
✅ **Error handling** - Built-in retry and error management  
✅ **Monitoring** - See execution history and logs  
✅ **Scheduling** - Can run automatically on schedule  
✅ **Integrations** - Can connect to other services  
✅ **Webhooks** - Can be triggered from anywhere  

## **Example Use Cases:**

### **1. Automated Email Updates:**
```bash
# Update item "3" email to ss@gmail.com
curl -X POST http://localhost:5678/webhook/YOUR_WEBHOOK_ID \
  -H "Content-Type: application/json" \
  -d '{"operation": "update_email", "itemName": "3", "email": "ss@gmail.com"}'
```

### **2. Search for Items:**
```bash
# Search for items containing "Task"
curl -X POST http://localhost:5678/webhook/YOUR_WEBHOOK_ID \
  -H "Content-Type: application/json" \
  -d '{"operation": "search_items", "term": "Task"}'
```

### **3. Bulk Updates:**
```bash
# Update multiple items
curl -X POST http://localhost:5678/webhook/YOUR_WEBHOOK_ID \
  -H "Content-Type: application/json" \
  -d '{"operation": "update_email", "itemName": "1", "email": "john@example.com"}'

curl -X POST http://localhost:5678/webhook/YOUR_WEBHOOK_ID \
  -H "Content-Type: application/json" \
  -d '{"operation": "update_email", "itemName": "2", "email": "jane@example.com"}'
```

## **Troubleshooting:**

### **If webhook returns 404:**
- Make sure workflow is **activated** (toggle is GREEN)
- Check the **webhook URL** is correct
- Verify the **webhook path** matches

### **If email update fails:**
- Check if **real Monday.com server** is running
- Verify **board ID** and **item ID** are correct
- Check **Monday.com API token** is valid

## **Next Steps:**

1. **Import the workflow** in n8n
2. **Activate it** (toggle switch)
3. **Test with curl commands** above
4. **Monitor executions** in n8n interface
5. **Deploy to production** when ready

---

**🎯 Once set up, n8n will provide a visual, automated way to update your Monday.com board!** 