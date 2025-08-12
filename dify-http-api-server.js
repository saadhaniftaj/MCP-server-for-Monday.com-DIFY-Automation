const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

console.log('🔓 Dify-HTTP-API Server - NO AUTHENTICATION REQUIRED');

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Dify-HTTP-API Server is running',
    auth: 'NO AUTHENTICATION REQUIRED'
  });
});

// Get board items by name
app.post('/api/get-board-items', (req, res) => {
  const { boardId, term } = req.body;
  
  console.log('📤 Get board items:', { boardId, term });
  
  // Mock response
  res.json({
    success: true,
    message: `Found items in board ${boardId} matching "${term}"`,
    data: [
      {
        id: 123,
        name: `Sample Item matching "${term}"`,
        boardId: boardId
      }
    ]
  });
});

// Change item column values
app.post('/api/change-item-column', (req, res) => {
  const { boardId, itemId, columnValues } = req.body;
  
  console.log('📤 Change item column:', { boardId, itemId, columnValues });
  
  // Mock response
  res.json({
    success: true,
    message: `Updated item ${itemId} in board ${boardId}`,
    data: {
      itemId: itemId,
      boardId: boardId,
      updatedColumns: columnValues
    }
  });
});

// Get board schema
app.post('/api/get-board-schema', (req, res) => {
  const { boardId } = req.body;
  
  console.log('📤 Get board schema:', { boardId });
  
  // Mock response
  res.json({
    success: true,
    message: `Retrieved schema for board ${boardId}`,
    data: {
      boardId: boardId,
      columns: [
        { id: 'name', title: 'Name', type: 'text' },
        { id: 'status', title: 'Status', type: 'status' },
        { id: 'date', title: 'Date', type: 'date' }
      ]
    }
  });
});

// List all available tools
app.get('/api/tools', (req, res) => {
  res.json({
    success: true,
    tools: [
      {
        name: 'get_board_items_by_name',
        description: 'Find items by name in a Monday.com board',
        endpoint: '/api/get-board-items',
        method: 'POST',
        parameters: {
          boardId: { type: 'number', required: true },
          term: { type: 'string', required: true }
        }
      },
      {
        name: 'change_item_column_values',
        description: 'Update column values for an item',
        endpoint: '/api/change-item-column',
        method: 'POST',
        parameters: {
          boardId: { type: 'number', required: true },
          itemId: { type: 'number', required: true },
          columnValues: { type: 'string', required: true }
        }
      },
      {
        name: 'get_board_schema',
        description: 'Get board schema including columns',
        endpoint: '/api/get-board-schema',
        method: 'POST',
        parameters: {
          boardId: { type: 'number', required: true }
        }
      }
    ]
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Dify-HTTP-API Server running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`📋 Tools list: http://localhost:${PORT}/api/tools`);
  console.log('🔓 NO AUTHENTICATION REQUIRED');
  console.log('📤 HTTP API endpoints:');
  console.log('   POST /api/get-board-items');
  console.log('   POST /api/change-item-column');
  console.log('   POST /api/get-board-schema');
  console.log('   GET  /api/tools');
}); 