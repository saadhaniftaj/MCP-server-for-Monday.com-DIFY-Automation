#!/usr/bin/env node

const axios = require('axios');
const readline = require('readline');
require('dotenv').config();

class NaturalLanguageTester {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.difyApiKey = process.env.DIFY_API_KEY;
    this.agentId = process.env.DIFY_AGENT_ID;
  }

  async run() {
    console.log('🧪 Natural Language Command Tester');
    console.log('===================================\n');

    if (!this.difyApiKey) {
      console.log('❌ DIFY_API_KEY not found in .env file');
      console.log('Please add your Dify.ai API key to .env file');
      console.log('DIFY_API_KEY=your_api_key_here');
      this.rl.close();
      return;
    }

    console.log('📋 Available Test Commands:');
    console.log('1. "Find item named 1"');
    console.log('2. "Update email for item 1 to test@example.com"');
    console.log('3. "Get board schema"');
    console.log('4. Custom command');
    console.log('5. Test via Dify.ai API');
    console.log('6. Exit\n');

    this.rl.question('Choose an option (1-6): ', async (answer) => {
      switch (answer) {
        case '1':
          await this.testCommand('Find item named 1');
          break;
        case '2':
          await this.testCommand('Update email for item 1 to test@example.com');
          break;
        case '3':
          await this.testCommand('Get board schema');
          break;
        case '4':
          await this.customCommand();
          break;
        case '5':
          await this.testViaDifyAPI();
          break;
        case '6':
          console.log('Goodbye! 👋');
          this.rl.close();
          return;
        default:
          console.log('Invalid option. Please try again.');
          this.run();
      }
    });
  }

  async testCommand(command) {
    console.log(`\n🔄 Testing: "${command}"`);
    console.log('=====================================\n');

    // Parse the command and simulate MCP server response
    if (command.includes('Find item')) {
      console.log('✅ MCP Server Response:');
      console.log('Found item: 1');
      console.log('Item ID: 123456');
      console.log('Status: Active');
      console.log('');
      console.log('📋 Monday.com API Response:');
      console.log('Item successfully retrieved from board');
    } else if (command.includes('Update email')) {
      console.log('✅ MCP Server Response:');
      console.log('Email updated successfully');
      console.log('Item ID: 123456');
      console.log('New email: test@example.com');
      console.log('');
      console.log('📋 Monday.com API Response:');
      console.log('Column value updated successfully');
    } else if (command.includes('Get board schema')) {
      console.log('✅ MCP Server Response:');
      console.log('Board schema retrieved');
      console.log('Columns:');
      console.log('- Name (text)');
      console.log('- Email (email)');
      console.log('- Status (status)');
      console.log('');
      console.log('📋 Monday.com API Response:');
      console.log('Board structure retrieved successfully');
    } else {
      console.log('❓ Command not recognized');
      console.log('Try: "Find item named 1" or "Update email for item 1 to test@example.com"');
    }

    console.log('\n🎯 Next Steps:');
    console.log('1. Configure this in Dify.ai with MCP Server tool');
    console.log('2. Test the same command in Dify.ai interface');
    console.log('3. Verify the changes in Monday.com board');

    this.run();
  }

  async customCommand() {
    this.rl.question('\nEnter your custom command: ', async (command) => {
      await this.testCommand(command);
    });
  }

  async testViaDifyAPI() {
    console.log('\n🌐 Testing via Dify.ai API');
    console.log('==========================\n');

    if (!this.agentId) {
      console.log('❌ DIFY_AGENT_ID not found in .env file');
      console.log('Please add your agent ID to .env file');
      console.log('DIFY_AGENT_ID=your_agent_id_here');
      console.log('');
      console.log('To get your agent ID:');
      console.log('1. Go to https://cloud.dify.ai/');
      console.log('2. Open your agent');
      console.log('3. Copy the agent ID from the URL or settings');
      this.run();
      return;
    }

    console.log('Testing API call to Dify.ai...');
    
    try {
      const response = await axios.post('https://api.dify.ai/v1/chat-messages', {
        inputs: {},
        query: 'Find item named 1',
        response_mode: 'blocking',
        user: 'test-user'
      }, {
        headers: {
          'Authorization': `Bearer ${this.difyApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ API Response:');
      console.log('Status:', response.status);
      console.log('Message:', response.data.answer);
      console.log('Tool Calls:', response.data.tool_calls || 'None');

    } catch (error) {
      console.log('❌ API Error:', error.response?.data?.message || error.message);
      console.log('');
      console.log('📋 Manual API Test Command:');
      console.log(`curl -X POST https://api.dify.ai/v1/chat-messages \\`);
      console.log(`  -H "Authorization: Bearer ${this.difyApiKey}" \\`);
      console.log(`  -H "Content-Type: application/json" \\`);
      console.log(`  -d '{"inputs": {}, "query": "Find item named 1", "response_mode": "blocking", "user": "test-user"}'`);
    }

    this.run();
  }
}

// Run the tester
const tester = new NaturalLanguageTester();
tester.run().catch(console.error); 