const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');

class MondayDifyMCPServer {
  constructor() {
    this.app = express();
    this.mcpProcess = null;
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
  }

  setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', message: 'Monday.com MCP Server is running' });
    });

    // Get item by name endpoint
    this.app.post('/get-item', async (req, res) => {
      try {
        const { boardId, itemName } = req.body;
        
        if (!boardId || !itemName) {
          return res.status(400).json({ 
            error: 'Missing required parameters: boardId and itemName' 
          });
        }

        const result = await this.callMCPServer('get_board_items_by_name', {
          boardId: parseInt(boardId),
          term: itemName
        });

        res.json(result);
      } catch (error) {
        console.error('Error in /get-item:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Update email endpoint
    this.app.post('/update-email', async (req, res) => {
      try {
        const { boardId, itemId, email } = req.body;
        
        if (!boardId || !itemId || !email) {
          return res.status(400).json({ 
            error: 'Missing required parameters: boardId, itemId, and email' 
          });
        }

        // Note: You'll need to know the email column ID for your board
        // This is a placeholder - you'll need to replace 'email_column_id' with actual column ID
        const columnValues = JSON.stringify({
          "email_column_id": email
        });

        const result = await this.callMCPServer('change_item_column_values', {
          boardId: parseInt(boardId),
          itemId: parseInt(itemId),
          columnValues
        });

        res.json(result);
      } catch (error) {
        console.error('Error in /update-email:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Natural language processing endpoint
    this.app.post('/process-command', async (req, res) => {
      try {
        const { command } = req.body;
        
        if (!command) {
          return res.status(400).json({ 
            error: 'Missing required parameter: command' 
          });
        }

        // Parse natural language command
        const parsed = this.parseNaturalLanguageCommand(command);
        
        if (!parsed) {
          return res.status(400).json({ 
            error: 'Could not parse command. Please use format: "Update email for item [ItemName] to [email@example.com]"' 
          });
        }

        // First, find the item
        const itemResult = await this.callMCPServer('get_board_items_by_name', {
          boardId: parsed.boardId,
          term: parsed.itemName
        });

        // Extract item ID from result
        const itemId = this.extractItemId(itemResult);
        
        if (!itemId) {
          return res.status(404).json({ 
            error: `Item "${parsed.itemName}" not found` 
          });
        }

        // Update the email
        const columnValues = JSON.stringify({
          "email_column_id": parsed.email
        });

        const updateResult = await this.callMCPServer('change_item_column_values', {
          boardId: parsed.boardId,
          itemId: parseInt(itemId),
          columnValues
        });

        res.json({
          message: `Successfully updated email for item "${parsed.itemName}" to ${parsed.email}`,
          itemId,
          result: updateResult
        });

      } catch (error) {
        console.error('Error in /process-command:', error);
        res.status(500).json({ error: error.message });
      }
    });
  }

  parseNaturalLanguageCommand(command) {
    // Simple regex-based parsing
    // Example: "Update email for item ProjectX to test@mail.com"
    const emailUpdateRegex = /update\s+email\s+for\s+item\s+(\w+)\s+to\s+([^\s]+)/i;
    const match = command.match(emailUpdateRegex);
    
    if (match) {
      return {
        itemName: match[1],
        email: match[2],
        boardId: process.env.MONDAY_BOARD_ID || 123456789 // Default board ID
      };
    }
    
    return null;
  }

  extractItemId(result) {
    try {
      // Parse the MCP server response to extract item ID
      // This is a simplified version - you may need to adjust based on actual response format
      const content = result.content || '';
      const idMatch = content.match(/id:\s*(\d+)/);
      return idMatch ? idMatch[1] : null;
    } catch (error) {
      console.error('Error extracting item ID:', error);
      return null;
    }
  }

  async callMCPServer(toolName, args) {
    return new Promise((resolve, reject) => {
      // This is a placeholder for the actual MCP server communication
      // In a real implementation, you would communicate with the MCP server via stdio
      console.log(`Calling MCP tool: ${toolName} with args:`, args);
      
      // For now, return a mock response
      resolve({
        content: `Mock response for ${toolName}`,
        success: true
      });
    });
  }

  start(port = 3000) {
    this.app.listen(port, () => {
      console.log(`Monday.com MCP Server running on port ${port}`);
      console.log(`Health check: http://localhost:${port}/health`);
    });
  }
}

// Start the server
const server = new MondayDifyMCPServer();
server.start();

module.exports = MondayDifyMCPServer; 