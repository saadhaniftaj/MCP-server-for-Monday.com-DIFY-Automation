const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
require('dotenv').config();

class EnhancedMondayDifyMCPServer {
  constructor() {
    this.app = express();
    this.mcpProcess = null;
    this.setupMiddleware();
    this.setupRoutes();
    this.initializeMCPServer();
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
    
    // No authentication required - open access
    console.log('🔓 Server configured with NO AUTHENTICATION - open access');
  }

  initializeMCPServer() {
    // Initialize the Monday.com MCP server process
    const mcpPath = path.join(__dirname, 'mcp', 'packages', 'monday-api-mcp');
    
    this.mcpProcess = spawn('node', ['dist/index.js'], {
      cwd: mcpPath,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        MONDAY_API_TOKEN: process.env.MONDAY_API_TOKEN
      }
    });

    this.mcpProcess.stdout.on('data', (data) => {
      console.log('MCP Server output:', data.toString());
    });

    this.mcpProcess.stderr.on('data', (data) => {
      console.error('MCP Server error:', data.toString());
    });

    this.mcpProcess.on('close', (code) => {
      console.log(`MCP Server process exited with code ${code}`);
    });
  }

  setupRoutes() {
    // Health check endpoint (no auth required)
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'ok', 
        message: 'Monday.com MCP Server is running',
        mcpProcess: this.mcpProcess ? 'running' : 'not running',
        auth: 'NO AUTHENTICATION REQUIRED - open access'
      });
    });

    // Get board schema endpoint
    this.app.get('/board-schema/:boardId', async (req, res) => {
      try {
        const { boardId } = req.params;
        
        const result = await this.callMCPServer('get_board_schema', {
          boardId: parseInt(boardId)
        });

        res.json(result);
      } catch (error) {
        console.error('Error in /board-schema:', error);
        res.status(500).json({ error: error.message });
      }
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
        const { boardId, itemId, email, emailColumnId } = req.body;
        
        if (!boardId || !itemId || !email) {
          return res.status(400).json({ 
            error: 'Missing required parameters: boardId, itemId, and email' 
          });
        }

        // Use provided email column ID or default from env
        const columnId = emailColumnId || process.env.EMAIL_COLUMN_ID;
        
        if (!columnId) {
          return res.status(400).json({ 
            error: 'Email column ID not provided. Please provide emailColumnId in request or set EMAIL_COLUMN_ID in environment.' 
          });
        }

        const columnValues = JSON.stringify({
          [columnId]: email
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
        const { command, boardId } = req.body;
        
        if (!command) {
          return res.status(400).json({ 
            error: 'Missing required parameter: command' 
          });
        }

        const targetBoardId = boardId || process.env.MONDAY_BOARD_ID;

        // Parse natural language command
        const parsed = this.parseNaturalLanguageCommand(command, targetBoardId);
        
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
        const columnId = process.env.EMAIL_COLUMN_ID;
        if (!columnId) {
          return res.status(400).json({ 
            error: 'EMAIL_COLUMN_ID not set in environment' 
          });
        }

        const columnValues = JSON.stringify({
          [columnId]: parsed.email
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

  parseNaturalLanguageCommand(command, boardId) {
    // Enhanced regex-based parsing
    // Example: "Update email for item ProjectX to test@mail.com"
    const emailUpdateRegex = /update\s+email\s+for\s+item\s+([^\s]+)\s+to\s+([^\s]+)/i;
    const match = command.match(emailUpdateRegex);
    
    if (match) {
      return {
        itemName: match[1],
        email: match[2],
        boardId: parseInt(boardId) || 123456789
      };
    }
    
    return null;
  }

  extractItemId(result) {
    try {
      // Parse the MCP server response to extract item ID
      const content = result.content || '';
      
      // Look for patterns like "id: 123456" or "id:123456"
      const idMatch = content.match(/id:\s*(\d+)/);
      if (idMatch) {
        return idMatch[1];
      }
      
      // If no match found, try to extract from the full response
      const jsonMatch = content.match(/\{.*"id":\s*"(\d+)".*\}/);
      if (jsonMatch) {
        return jsonMatch[1];
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting item ID:', error);
      return null;
    }
  }

  async callMCPServer(toolName, args) {
    return new Promise((resolve, reject) => {
      // For now, we'll use a mock implementation
      // In a real implementation, you would communicate with the MCP server via stdio
      console.log(`Calling MCP tool: ${toolName} with args:`, args);
      
      // Simulate MCP server response
      setTimeout(() => {
        if (toolName === 'get_board_items_by_name') {
          resolve({
            content: `Items name: ${args.term}, id: 123456 successfully fetched`,
            success: true
          });
        } else if (toolName === 'change_item_column_values') {
          resolve({
            content: `Item ${args.itemId} successfully updated with the new column values`,
            success: true
          });
        } else if (toolName === 'get_board_schema') {
          resolve({
            content: `Board schema retrieved for board ${args.boardId}`,
            success: true
          });
        } else {
          resolve({
            content: `Mock response for ${toolName}`,
            success: true
          });
        }
      }, 100);
    });
  }

  start(port = process.env.PORT || 3000) {
    this.app.listen(port, () => {
      console.log(`Enhanced Monday.com MCP Server running on port ${port}`);
      console.log(`Health check: http://localhost:${port}/health`);
      console.log(`Board schema: http://localhost:${port}/board-schema/:boardId`);
      console.log(`Get item: POST http://localhost:${port}/get-item`);
      console.log(`Update email: POST http://localhost:${port}/update-email`);
      console.log(`Process command: POST http://localhost:${port}/process-command`);
      console.log(`🔓 NO AUTHENTICATION REQUIRED - open access`);
    });
  }
}

// Start the server
const server = new EnhancedMondayDifyMCPServer();
server.start();

module.exports = EnhancedMondayDifyMCPServer; 