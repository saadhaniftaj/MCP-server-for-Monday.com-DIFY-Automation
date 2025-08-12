#!/usr/bin/env node

const { spawn } = require('child_process');
const axios = require('axios');
const readline = require('readline');
require('dotenv').config();

class DifyAgentSetup {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async run() {
    console.log('🚀 Dify.ai Agent Setup - Monday.com MCP Integration');
    console.log('==================================================\n');

    console.log('📋 Setup Steps:');
    console.log('1. Get Dify.ai API Key');
    console.log('2. Configure Dify CLI');
    console.log('3. Create Agent with MCP Server');
    console.log('4. Test Natural Language Commands\n');

    await this.getDifyAPIKey();
  }

  async getDifyAPIKey() {
    console.log('🔑 Step 1: Get Dify.ai API Key');
    console.log('==============================\n');
    
    console.log('To get your Dify.ai API key:');
    console.log('1. Go to https://cloud.dify.ai/');
    console.log('2. Sign in to your account');
    console.log('3. Go to Settings → API Keys');
    console.log('4. Create a new API key\n');

    this.rl.question('Enter your Dify.ai API key (or press Enter to skip): ', async (apiKey) => {
      if (apiKey.trim()) {
        process.env.DIFY_API_KEY = apiKey.trim();
        console.log('✅ API key saved');
        await this.configureDifyCLI();
      } else {
        console.log('⚠️  Skipping API key setup. You can add it later.');
        await this.showManualSetup();
      }
    });
  }

  async configureDifyCLI() {
    console.log('\n⚙️  Step 2: Configure Dify CLI');
    console.log('==============================\n');

    console.log('Setting up Dify CLI configuration...');
    
    try {
      // Test the API key
      const response = await axios.get('https://api.dify.ai/v1/workspaces', {
        headers: {
          'Authorization': `Bearer ${process.env.DIFY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ API key is valid');
      console.log(`✅ Connected to workspace: ${response.data.data[0]?.name || 'Default'}`);
      
      await this.createAgent();
    } catch (error) {
      console.log('❌ API key validation failed:', error.response?.data?.message || error.message);
      console.log('Please check your API key and try again.');
      this.rl.close();
    }
  }

  async createAgent() {
    console.log('\n🤖 Step 3: Create Agent with MCP Server');
    console.log('========================================\n');

    console.log('Creating agent via Dify.ai API...');
    
    try {
      const agentData = {
        name: 'Monday.com MCP Agent',
        description: 'AI agent that integrates with Monday.com via MCP to update item data',
        model: {
          provider: 'openai',
          name: 'gpt-4',
          mode: 'chat',
          completion_params: {
            temperature: 0.7,
            max_tokens: 2000
          }
        },
        prompt_type: 'simple',
        prompt_messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that can interact with Monday.com boards through the MCP server. You can help users find items, update email addresses, and process natural language commands to modify Monday.com data. Always use the available MCP tools to perform actions.'
          }
        ]
      };

      const response = await axios.post('https://api.dify.ai/v1/agents', agentData, {
        headers: {
          'Authorization': `Bearer ${process.env.DIFY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const agentId = response.data.id;
      console.log(`✅ Agent created successfully!`);
      console.log(`   Agent ID: ${agentId}`);
      console.log(`   Name: ${response.data.name}`);
      
      await this.configureMCPServer(agentId);
    } catch (error) {
      console.log('❌ Failed to create agent:', error.response?.data?.message || error.message);
      await this.showManualSetup();
    }
  }

  async configureMCPServer(agentId) {
    console.log('\n🔧 Step 4: Configure MCP Server');
    console.log('===============================\n');

    console.log('Now you need to manually configure the MCP server in Dify.ai:');
    console.log('');
    console.log('1. Go to https://cloud.dify.ai/');
    console.log(`2. Open your agent: ${agentId}`);
    console.log('3. Go to "Tools" section');
    console.log('4. Click "Add Tool"');
    console.log('5. Select "MCP Server"');
    console.log('6. Configure with these settings:');
    console.log('');
    console.log('   Command: node simple-mcp-server.js');
    console.log('   Working Directory: /Users/applestore/Desktop/aws-fiverr/ww/mcp rampup/monday:defy POC');
    console.log('');
    console.log('   Environment Variables:');
    console.log(`   MONDAY_API_TOKEN: ${process.env.MONDAY_API_TOKEN}`);
    console.log(`   MONDAY_BOARD_ID: ${process.env.MONDAY_BOARD_ID}`);
    console.log(`   EMAIL_COLUMN_ID: ${process.env.EMAIL_COLUMN_ID}`);
    console.log('');
    console.log('7. Save the tool');
    console.log('8. Test with natural language commands');

    await this.testNaturalLanguageCommands(agentId);
  }

  async testNaturalLanguageCommands(agentId) {
    console.log('\n🧪 Step 5: Test Natural Language Commands');
    console.log('=========================================\n');

    console.log('Once you\'ve configured the MCP server, test these commands:');
    console.log('');
    console.log('Test Commands:');
    console.log('1. "Find item named 1"');
    console.log('2. "Update email for item 1 to test@example.com"');
    console.log('3. "Get board schema"');
    console.log('');

    console.log('You can test via:');
    console.log('1. Dify.ai web interface');
    console.log('2. API calls (see below)');
    console.log('3. Our CLI test script');
    console.log('');

    console.log('📋 API Test Command:');
    console.log(`curl -X POST https://api.dify.ai/v1/chat-messages \\`);
    console.log(`  -H "Authorization: Bearer ${process.env.DIFY_API_KEY}" \\`);
    console.log(`  -H "Content-Type: application/json" \\`);
    console.log(`  -d '{"inputs": {}, "query": "Find item named 1", "response_mode": "blocking", "user": "test-user"}'`);

    console.log('\n🎉 Setup Complete!');
    console.log('Your MCP server is ready for natural language commands.');
    
    this.rl.close();
  }

  async showManualSetup() {
    console.log('\n📋 Manual Setup Instructions');
    console.log('============================\n');

    console.log('Since automated setup failed, here\'s how to do it manually:');
    console.log('');
    console.log('1. Go to https://cloud.dify.ai/');
    console.log('2. Create a new agent');
    console.log('3. Add MCP Server tool with these settings:');
    console.log('');
    console.log('   Command: node simple-mcp-server.js');
    console.log('   Working Directory: /Users/applestore/Desktop/aws-fiverr/ww/mcp rampup/monday:defy POC');
    console.log('');
    console.log('   Environment Variables:');
    console.log(`   MONDAY_API_TOKEN: ${process.env.MONDAY_API_TOKEN}`);
    console.log(`   MONDAY_BOARD_ID: ${process.env.MONDAY_BOARD_ID}`);
    console.log(`   EMAIL_COLUMN_ID: ${process.env.EMAIL_COLUMN_ID}`);
    console.log('');
    console.log('4. Test with: "Find item named 1"');

    this.rl.close();
  }
}

// Run the setup
const setup = new DifyAgentSetup();
setup.run().catch(console.error); 