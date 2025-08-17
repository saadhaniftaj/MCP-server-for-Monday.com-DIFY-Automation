const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Monday.com API configuration
const MONDAY_API_TOKEN = process.env.MONDAY_API_TOKEN;
const MONDAY_API_URL = 'https://api.monday.com/v2';

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: "ok",
    message: "Real Monday.com Server is running",
    version: "1.0.0",
    monday_connected: !!MONDAY_API_TOKEN
  });
});

// Real Monday.com email update with correct format
app.post('/api/monday/update-email', async (req, res) => {
  const { itemName, email, boardId = 2056518483, itemId = 456 } = req.body;
  
  if (!itemName || !email) {
    return res.status(400).json({
      error: "Missing required fields: itemName and email"
    });
  }

  if (!MONDAY_API_TOKEN) {
    return res.status(500).json({
      error: "Monday.com API token not configured"
    });
  }

  try {
    // Real Monday.com GraphQL mutation with correct email format
    const mutation = `
      mutation {
        change_column_value(
          board_id: ${boardId},
          item_id: ${itemId},
          column_id: "email_mktp3awp",
          value: "{\\"text\\": \\"${email}\\", \\"email\\": \\"${email}\\"}"
        ) {
          id
          name
        }
      }
    `;

    const response = await axios.post(MONDAY_API_URL, 
      { query: mutation },
      {
        headers: {
          'Authorization': MONDAY_API_TOKEN,
          'Content-Type': 'application/json'
        }
      }
    );

    const result = {
      status: "success",
      message: `Email updated for item "${itemName}" to ${email}`,
      itemName: itemName,
      email: email,
      monday_response: response.data,
      timestamp: new Date().toISOString()
    };

    res.json(result);
  } catch (error) {
    console.error('Monday.com API error:', error.response?.data || error.message);
    res.status(500).json({
      error: "Failed to update Monday.com",
      details: error.response?.data || error.message
    });
  }
});

// Real Monday.com item search with correct query
app.post('/api/monday/search-items', async (req, res) => {
  const { boardId, term } = req.body;
  
  if (!boardId || !term) {
    return res.status(400).json({
      error: "Missing required fields: boardId and term"
    });
  }

  if (!MONDAY_API_TOKEN) {
    return res.status(500).json({
      error: "Monday.com API token not configured"
    });
  }

  try {
    // Real Monday.com GraphQL query with correct structure
    const query = `
      query {
        boards(ids: [${boardId}]) {
          items_page {
            items {
              id
              name
              column_values {
                id
                text
                value
              }
            }
          }
        }
      }
    `;

    const response = await axios.post(MONDAY_API_URL, 
      { query: query },
      {
        headers: {
          'Authorization': MONDAY_API_TOKEN,
          'Content-Type': 'application/json'
        }
      }
    );

    const items = response.data?.data?.boards?.[0]?.items_page?.items || [];
    const filteredItems = items.filter(item => 
      item.name.toLowerCase().includes(term.toLowerCase())
    );

    const result = {
      items: filteredItems,
      total: filteredItems.length,
      monday_response: response.data
    };

    res.json(result);
  } catch (error) {
    console.error('Monday.com API error:', error.response?.data || error.message);
    res.status(500).json({
      error: "Failed to search Monday.com",
      details: error.response?.data || error.message
    });
  }
});

// Get board schema
app.get('/api/monday/board-schema/:boardId', async (req, res) => {
  const { boardId } = req.params;
  
  if (!boardId) {
    return res.status(400).json({
      error: "Missing boardId parameter"
    });
  }

  if (!MONDAY_API_TOKEN) {
    return res.status(500).json({
      error: "Monday.com API token not configured"
    });
  }

  try {
    const query = `
      query {
        boards(ids: [${boardId}]) {
          columns {
            id
            title
            type
          }
        }
      }
    `;

    const response = await axios.post(MONDAY_API_URL, 
      { query: query },
      {
        headers: {
          'Authorization': MONDAY_API_TOKEN,
          'Content-Type': 'application/json'
        }
      }
    );

    const columns = response.data?.data?.boards?.[0]?.columns || [];

    const result = {
      boardId: boardId,
      columns: columns,
      monday_response: response.data
    };

    res.json(result);
  } catch (error) {
    console.error('Monday.com API error:', error.response?.data || error.message);
    res.status(500).json({
      error: "Failed to get board schema",
      details: error.response?.data || error.message
    });
  }
});

// Get all items from board
app.get('/api/monday/board-items/:boardId', async (req, res) => {
  const { boardId } = req.params;
  
  if (!boardId) {
    return res.status(400).json({
      error: "Missing boardId parameter"
    });
  }

  if (!MONDAY_API_TOKEN) {
    return res.status(500).json({
      error: "Monday.com API token not configured"
    });
  }

  try {
    const query = `
      query {
        boards(ids: [${boardId}]) {
          items_page {
            items {
              id
              name
              column_values {
                id
                text
                value
              }
            }
          }
        }
      }
    `;

    const response = await axios.post(MONDAY_API_URL, 
      { query: query },
      {
        headers: {
          'Authorization': MONDAY_API_TOKEN,
          'Content-Type': 'application/json'
        }
      }
    );

    const items = response.data?.data?.boards?.[0]?.items_page?.items || [];

    const result = {
      boardId: boardId,
      items: items,
      total: items.length,
      monday_response: response.data
    };

    res.json(result);
  } catch (error) {
    console.error('Monday.com API error:', error.response?.data || error.message);
    res.status(500).json({
      error: "Failed to get board items",
      details: error.response?.data || error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Real Monday.com Server (Correct) running on port ${PORT}`);
  console.log(`🔑 Monday.com API Token: ${MONDAY_API_TOKEN ? 'Configured' : 'NOT CONFIGURED'}`);
  console.log(`📋 Board ID: 2056518483`);
  console.log(`📧 Email Column ID: email_mktp3awp`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`📝 Note: This server actually connects to Monday.com API with correct format`);
}); 