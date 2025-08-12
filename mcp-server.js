const { spawn } = require('child_process');
const path = require('path');
require('dotenv').config();

class MondayMCPServer {
  constructor() {
    this.mcpProcess = null;
    this.initializeMCPServer();
  }

  initializeMCPServer() {
    // Initialize the Monday.com MCP server process
    const mcpPath = path.join(__dirname, 'mcp', 'packages', 'monday-api-mcp');
    
    console.log('Starting Monday.com MCP server...');
    console.log('MCP Path:', mcpPath);
    
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

    this.mcpProcess.on('error', (error) => {
      console.error('MCP Server process error:', error);
    });
  }

  start() {
    console.log('Monday.com MCP Server is ready for Dify.ai connection');
    console.log('Make sure to build the MCP server first:');
    console.log('cd mcp/packages/monday-api-mcp && npm install && npm run build');
    console.log('');
    console.log('Then in Dify.ai:');
    console.log('1. Add MCP Server tool');
    console.log('2. Set command: node mcp-server.js');
    console.log('3. Set working directory: /path/to/your/project');
    console.log('4. No authentication required for MCP protocol');
  }
}

// Start the MCP server
const server = new MondayMCPServer();
server.start();

// Keep the process alive
process.on('SIGINT', () => {
  console.log('Shutting down MCP server...');
  if (server.mcpProcess) {
    server.mcpProcess.kill();
  }
  process.exit(0);
});

module.exports = MondayMCPServer; 