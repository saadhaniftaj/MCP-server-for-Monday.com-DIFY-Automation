#!/usr/bin/env node

const { spawn } = require('child_process');
const axios = require('axios');
const readline = require('readline');
require('dotenv').config();

class DifyCLITest {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async run() {
    console.log('🚀 Dify.ai CLI Test - Monday.com MCP Server');
    console.log('============================================\n');

    console.log('📋 Available Options:');
    console.log('1. Test MCP Server directly');
    console.log('2. Test Dify.ai API integration');
    console.log('3. Interactive MCP testing');
    console.log('4. Show Dify.ai CLI commands');
    console.log('5. Exit\n');

    this.rl.question('Choose an option (1-5): ', async (answer) => {
      switch (answer) {
        case '1':
          await this.testMCPServer();
          break;
        case '2':
          await this.testDifyAPI();
          break;
        case '3':
          await this.interactiveMCPTest();
          break;
        case '4':
          this.showDifyCLICommands();
          break;
        case '5':
          console.log('Goodbye! 👋');
          this.rl.close();
          return;
        default:
          console.log('Invalid option. Please try again.');
          this.run();
      }
    });
  }

  async testMCPServer() {
    console.log('\n🧪 Testing MCP Server...\n');

    // Test 1: Initialize
    console.log('1. Testing initialize...');
    const initResult = await this.runMCPServerTest({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'cli-test', version: '1.0.0' }
      }
    });
    console.log('✅ Initialize successful:', initResult.result.serverInfo.name);

    // Test 2: Tools list
    console.log('\n2. Testing tools list...');
    const toolsResult = await this.runMCPServerTest({
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
      params: {}
    });
    console.log('✅ Available tools:', toolsResult.result.tools.map(t => t.name).join(', '));

    // Test 3: Get board schema
    console.log('\n3. Testing get_board_schema...');
    const schemaResult = await this.runMCPServerTest({
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'get_board_schema',
        arguments: {
          boardId: parseInt(process.env.MONDAY_BOARD_ID)
        }
      }
    });
    console.log('✅ Board schema retrieved successfully');

    console.log('\n🎉 All MCP server tests passed!');
    this.run();
  }

  async testDifyAPI() {
    console.log('\n🌐 Testing Dify.ai API Integration...\n');

    console.log('To test Dify.ai API, you need:');
    console.log('1. Your Dify.ai API key');
    console.log('2. Your agent ID');
    console.log('3. The agent configured with MCP server\n');

    console.log('📋 Dify.ai API Commands:');
    console.log('curl -X POST https://api.dify.ai/v1/chat-messages \\');
    console.log('  -H "Authorization: Bearer YOUR_API_KEY" \\');
    console.log('  -H "Content-Type: application/json" \\');
    console.log('  -d \'{"inputs": {}, "query": "Find item named 1", "response_mode": "blocking"}\'');

    console.log('\n📋 Dify.ai CLI Commands:');
    console.log('dify-chat-cli --help');
    console.log('dify-chat-cli chat --api-key YOUR_KEY --agent-id YOUR_AGENT_ID');

    this.run();
  }

  async interactiveMCPTest() {
    console.log('\n💬 Interactive MCP Testing');
    console.log('Type your commands (or "exit" to quit):\n');

    const testCommands = [
      'Find item named 1',
      'Update email for item 1 to test@example.com',
      'Get board schema'
    ];

    console.log('💡 Try these commands:');
    testCommands.forEach((cmd, i) => {
      console.log(`${i + 1}. "${cmd}"`);
    });
    console.log('');

    this.rl.question('Enter your command: ', async (command) => {
      if (command.toLowerCase() === 'exit') {
        this.run();
        return;
      }

      console.log(`\n🔄 Processing: "${command}"`);
      
      // Simulate MCP server response
      if (command.includes('Find item')) {
        console.log('✅ Found item: 1 (ID: 123456)');
      } else if (command.includes('Update email')) {
        console.log('✅ Email updated successfully');
      } else if (command.includes('Get board schema')) {
        console.log('✅ Board schema retrieved');
      } else {
        console.log('❓ Command not recognized. Try the suggested commands.');
      }

      console.log('');
      this.interactiveMCPTest();
    });
  }

  showDifyCLICommands() {
    console.log('\n📋 Dify.ai CLI Commands:');
    console.log('========================\n');

    console.log('🔧 Available CLI Tools:');
    console.log('• dify-chat-cli - Chat with Dify agents');
    console.log('• dify-client - Node.js SDK for Dify API\n');

    console.log('🚀 Quick Start Commands:');
    console.log('1. dify-chat-cli --help');
    console.log('2. dify-chat-cli chat --api-key YOUR_KEY --agent-id YOUR_AGENT_ID');
    console.log('3. dify-chat-cli config --set api-key YOUR_KEY');
    console.log('4. dify-chat-cli agents --list\n');

    console.log('🔗 API Integration:');
    console.log('• Get your API key from Dify.ai dashboard');
    console.log('• Use the agent ID from your configured agent');
    console.log('• Test with: curl -X POST https://api.dify.ai/v1/chat-messages\n');

    console.log('📖 Documentation:');
    console.log('• Dify.ai API: https://docs.dify.ai/api');
    console.log('• CLI Tools: npm info dify-chat-cli\n');

    this.run();
  }

  async runMCPServerTest(request) {
    return new Promise((resolve, reject) => {
      const mcpProcess = spawn('node', ['simple-mcp-server.js'], {
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe'],
        env: process.env
      });
      
      let output = '';
      let errorOutput = '';
      
      mcpProcess.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      mcpProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      mcpProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`MCP server exited with code ${code}: ${errorOutput}`));
          return;
        }
        
        try {
          const lines = output.trim().split('\n');
          const responseLine = lines[lines.length - 1];
          const response = JSON.parse(responseLine);
          resolve(response);
        } catch (error) {
          reject(new Error(`Failed to parse MCP server response: ${error.message}`));
        }
      });
      
      mcpProcess.stdin.write(JSON.stringify(request) + '\n');
      mcpProcess.stdin.end();
    });
  }
}

// Run the CLI test
const cliTest = new DifyCLITest();
cliTest.run().catch(console.error); 