const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = 3001; // Changed from 3000 to avoid conflict with Dify.ai

// Middleware
app.use(cors());
app.use(express.json());

// Monday.com API configuration
const MONDAY_API_URL = 'https://api.monday.com/v2';
const MONDAY_API_TOKEN = process.env.MONDAY_API_TOKEN || 'eyJhbGciOiJIUzI1NiJ9.eyJ0eXBlIjoiV1QiLCJzZXNzaW9uSWQiOjM0NzE5NzE5LCJ1c2VySWQiOjQ5NzE5NzE5fQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

// MCP Endpoints
app.post('/notifications/initialized', (req, res) => {
    console.log('📧 MCP Notification: initialized');
    // Return HTTP 204 No Content for notifications (MCP spec)
    res.status(204).send();
});

app.post('/tools/list', (req, res) => {
    console.log('🔧 MCP Request: tools/list');
    const response = {
        jsonrpc: "2.0",
        id: req.body.id,
        result: {
            tools: [
                {
                    name: "update_email",
                    description: "Updates email for a specific item in Monday.com board",
                    inputSchema: {
                        type: "object",
                        properties: {
                            itemName: {
                                type: "string",
                                description: "Name of the item to update"
                            },
                            email: {
                                type: "string",
                                description: "Email address to set",
                                format: "email"
                            },
                            boardId: {
                                type: "number",
                                description: "Monday.com board ID"
                            },
                            itemId: {
                                type: "number",
                                description: "Monday.com item ID"
                            }
                        },
                        required: ["itemName", "email", "boardId", "itemId"]
                    }
                },
                {
                    name: "search_items",
                    description: "Searches for items in Monday.com board",
                    inputSchema: {
                        type: "object",
                        properties: {
                            boardId: {
                                type: "number",
                                description: "Monday.com board ID"
                            },
                            term: {
                                type: "string",
                                description: "Search term"
                            }
                        },
                        required: ["boardId", "term"]
                    }
                },
                {
                    name: "update_column",
                    description: "Updates any column value for a specific item in Monday.com board",
                    inputSchema: {
                        type: "object",
                        properties: {
                            itemId: {
                                type: "number",
                                description: "Monday.com item ID"
                            },
                            columnId: {
                                type: "string",
                                description: "Column ID to update"
                            },
                            value: {
                                type: "string",
                                description: "Value to set"
                            }
                        },
                        required: ["itemId", "columnId", "value"]
                    }
                }
            ]
        }
    };
    res.json(response);
});

app.post('/tools/call', async (req, res) => {
    console.log('🚀 MCP Request: tools/call', req.body);
    
    const { name, arguments: args } = req.body.params;
    
    try {
        let result;
        
        switch (name) {
            case 'update_email':
                result = await updateEmail(args);
                break;
            case 'search_items':
                result = await searchItems(args);
                break;
            case 'update_column':
                result = await updateColumn(args);
                break;
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
        
        const response = {
            jsonrpc: "2.0",
            id: req.body.id,
            result: {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(result, null, 2)
                    }
                ]
            }
        };
        
        res.json(response);
        
    } catch (error) {
        console.error('❌ MCP Error:', error);
        const response = {
            jsonrpc: "2.0",
            id: req.body.id,
            error: {
                code: -32603,
                message: error.message
            }
        };
        res.json(response);
    }
});

// Direct HTTP API Endpoints (for testing)
app.get('/api/monday/board-items/:boardId', async (req, res) => {
    try {
        const { boardId } = req.params;
        const query = `
            query {
                boards(ids: ${boardId}) {
                    items {
                        id
                        name
                        column_values {
                            id
                            title
                            text
                            value
                        }
                    }
                }
            }
        `;
        
        const response = await axios.post(MONDAY_API_URL, { query }, {
            headers: {
                'Authorization': MONDAY_API_TOKEN,
                'Content-Type': 'application/json'
            }
        });
        
        res.json(response.data);
    } catch (error) {
        console.error('❌ Error fetching board items:', error.response?.data || error.message);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/monday/update-email', async (req, res) => {
    try {
        const { itemName, email, boardId, itemId } = req.body;
        const result = await updateEmail({ itemName, email, boardId, itemId });
        res.json(result);
    } catch (error) {
        console.error('❌ Error updating email:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/monday/search-items', async (req, res) => {
    try {
        const { boardId, term } = req.body;
        const result = await searchItems({ boardId, term });
        res.json(result);
    } catch (error) {
        console.error('❌ Error searching items:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/monday/update-column', async (req, res) => {
    try {
        const { itemId, columnId, value } = req.body;
        const result = await updateColumn({ itemId, columnId, value });
        res.json(result);
    } catch (error) {
        console.error('❌ Error updating column:', error);
        res.status(500).json({ error: error.message });
    }
});

// Helper functions
async function updateEmail({ itemName, email, boardId, itemId }) {
    console.log(`📧 Updating email for item "${itemName}" to "${email}"`);
    
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
    
    const response = await axios.post(MONDAY_API_URL, { query: mutation }, {
        headers: {
            'Authorization': MONDAY_API_TOKEN,
            'Content-Type': 'application/json'
        }
    });
    
    if (response.data.errors) {
        throw new Error(`Monday.com API error: ${JSON.stringify(response.data.errors)}`);
    }
    
    return {
        success: true,
        message: `Email updated for item "${itemName}" to "${email}"`,
        data: response.data.data
    };
}

async function searchItems({ boardId, term }) {
    console.log(`🔍 Searching for "${term}" in board ${boardId}`);
    
    const query = `
        query {
            items_page(
                query_params: {
                    board_ids: [${boardId}],
                    search: "${term}"
                }
            ) {
                items {
                    id
                    name
                    column_values {
                        id
                        title
                        text
                        value
                    }
                }
            }
        }
    `;
    
    const response = await axios.post(MONDAY_API_URL, { query }, {
        headers: {
            'Authorization': MONDAY_API_TOKEN,
            'Content-Type': 'application/json'
        }
    });
    
    if (response.data.errors) {
        throw new Error(`Monday.com API error: ${JSON.stringify(response.data.errors)}`);
    }
    
    return {
        success: true,
        message: `Found ${response.data.data.items_page.items.length} items matching "${term}"`,
        data: response.data.data.items_page.items
    };
}

async function updateColumn({ itemId, columnId, value }) {
    console.log(`📝 Updating column ${columnId} for item ${itemId} to "${value}"`);
    
    // Determine the value format based on column type
    let formattedValue = value;
    
    // For email columns
    if (columnId === 'email_mktp3awp') {
        formattedValue = `{"text": "${value}", "email": "${value}"}`;
    }
    // For status columns
    else if (columnId.includes('status')) {
        formattedValue = `{"labels": ["${value}"]}`;
    }
    // For text columns
    else {
        formattedValue = `{"text": "${value}"}`;
    }
    
    const mutation = `
        mutation {
            change_column_value(
                item_id: ${itemId},
                column_id: "${columnId}",
                value: "${formattedValue.replace(/"/g, '\\"')}"
            ) {
                id
                name
            }
        }
    `;
    
    const response = await axios.post(MONDAY_API_URL, { query: mutation }, {
        headers: {
            'Authorization': MONDAY_API_TOKEN,
            'Content-Type': 'application/json'
        }
    });
    
    if (response.data.errors) {
        throw new Error(`Monday.com API error: ${JSON.stringify(response.data.errors)}`);
    }
    
    return {
        success: true,
        message: `Column ${columnId} updated for item ${itemId} to "${value}"`,
        data: response.data.data
    };
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Monday.com MCP Server running on port 3001',
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Monday.com MCP Server running on http://localhost:${PORT}`);
    console.log(`📧 MCP Endpoints:`);
    console.log(`   POST /notifications/initialized`);
    console.log(`   POST /tools/list`);
    console.log(`   POST /tools/call`);
    console.log(`📡 HTTP API Endpoints:`);
    console.log(`   GET  /api/monday/board-items/:boardId`);
    console.log(`   POST /api/monday/update-email`);
    console.log(`   POST /api/monday/search-items`);
    console.log(`   POST /api/monday/update-column`);
    console.log(`❤️  Health check: GET /health`);
});
