const { spawn } = require('child_process');
const path = require('path');
require('dotenv').config();

class WorkingMCPServer {
  constructor() {
    this.mcpProcess = null;
    this.initializeMCPServer();
  }

  initializeMCPServer() {
    // Use the direct Monday.com MCP server
    const mcpPath = path.join(__dirname, 'mcp', 'packages', 'monday-api-mcp');
    
    console.log('Starting Monday.com MCP server...');
    console.log('MCP Path:', mcpPath);
    
    // Set environment variables
    const env = {
      ...process.env,
      MONDAY_API_TOKEN: process.env.MONDAY_API_TOKEN,
      MONDAY_BOARD_ID: process.env.MONDAY_BOARD_ID,
      NODE_ENV: 'production'
    };
    
    // Start the MCP server process
    this.mcpProcess = spawn('node', ['dist/index.js'], {
      cwd: mcpPath,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: env
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

    this.mcpProcess.on('error', (error) => {
      console.error('MCP Server process error:', error);
    });
  }

  start() {
    console.log('✅ Monday.com MCP Server is ready for Dify.ai connection');
    console.log('');
    console.log('📋 Dify.ai Configuration:');
    console.log('1. Go to your Dify.ai agent');
    console.log('2. Add MCP Server tool');
    console.log('3. Set command: node working-mcp-server.js');
    console.log('4. Set working directory: /Users/applestore/Desktop/aws-fiverr/ww/mcp rampup/monday:defy POC');
    console.log('5. No authentication required - MCP protocol handles this');
    console.log('');
    console.log('🔧 Available MCP Tools:');
    console.log('- get_board_items_by_name: Find items by name');
    console.log('- change_item_column_values: Update item columns');
    console.log('- get_board_schema: Get board structure');
    console.log('');
    console.log('🧪 Test Commands:');
    console.log('- "Find item named 1"');
    console.log('- "Update email for item 1 to test@example.com"');
    console.log('- "Get board schema"');
  }
}

// Start the MCP server
const server = new WorkingMCPServer();
server.start();

// Keep the process alive
process.on('SIGINT', () => {
  console.log('Shutting down MCP server...');
  if (server.mcpProcess) {
    server.mcpProcess.kill();
  }
  process.exit(0);
});

module.exports = WorkingMCPServer; 