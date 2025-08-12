#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const axios = require('axios');
require('dotenv').config();

class AutomatedSetup {
  constructor() {
    this.projectPath = process.cwd();
    this.envFile = path.join(this.projectPath, '.env');
    this.mcpServerFile = path.join(this.projectPath, 'simple-mcp-server.js');
  }

  async run() {
    console.log('🚀 Monday.com MCP Server - Automated Setup');
    console.log('==========================================\n');

    try {
      // Step 1: Check environment
      await this.checkEnvironment();
      
      // Step 2: Verify dependencies
      await this.checkDependencies();
      
      // Step 3: Test MCP server
      await this.testMCPServer();
      
      // Step 4: Generate Dify.ai configuration
      await this.generateDifyConfig();
      
      // Step 5: Provide setup instructions
      this.provideSetupInstructions();
      
      console.log('\n✅ Setup completed successfully!');
      
    } catch (error) {
      console.error('\n❌ Setup failed:', error.message);
      process.exit(1);
    }
  }

  async checkEnvironment() {
    console.log('📋 Step 1: Checking environment...');
    
    const requiredVars = ['MONDAY_API_TOKEN', 'MONDAY_BOARD_ID'];
    const missingVars = [];
    
    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        missingVars.push(varName);
      }
    }
    
    if (missingVars.length > 0) {
      throw new Error(`Missing environment variables: ${missingVars.join(', ')}`);
    }
    
    console.log('✅ Environment variables found');
    console.log(`   - MONDAY_API_TOKEN: ${process.env.MONDAY_API_TOKEN.substring(0, 20)}...`);
    console.log(`   - MONDAY_BOARD_ID: ${process.env.MONDAY_BOARD_ID}`);
    
    if (process.env.EMAIL_COLUMN_ID) {
      console.log(`   - EMAIL_COLUMN_ID: ${process.env.EMAIL_COLUMN_ID}`);
    } else {
      console.log('   ⚠️  EMAIL_COLUMN_ID not set (will be auto-detected)');
    }
  }

  async checkDependencies() {
    console.log('\n📦 Step 2: Checking dependencies...');
    
    const requiredFiles = [
      'package.json',
      'simple-mcp-server.js',
      '.env'
    ];
    
    for (const file of requiredFiles) {
      if (!fs.existsSync(path.join(this.projectPath, file))) {
        throw new Error(`Missing required file: ${file}`);
      }
    }
    
    console.log('✅ All required files found');
    
    // Check if node_modules exists
    if (!fs.existsSync(path.join(this.projectPath, 'node_modules'))) {
      console.log('📦 Installing dependencies...');
      await this.runCommand('npm install');
    } else {
      console.log('✅ Dependencies already installed');
    }
  }

  async testMCPServer() {
    console.log('\n🧪 Step 3: Testing MCP server...');
    
    // Test the MCP server with a simple initialize request
    const testRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'automated-test', version: '1.0.0' }
      }
    };
    
    try {
      const result = await this.runMCPServerTest(testRequest);
      console.log('✅ MCP server test successful');
      console.log(`   - Server: ${result.result.serverInfo.name} v${result.result.serverInfo.version}`);
    } catch (error) {
      throw new Error(`MCP server test failed: ${error.message}`);
    }
  }

  async runMCPServerTest(request) {
    return new Promise((resolve, reject) => {
      const mcpProcess = spawn('node', ['simple-mcp-server.js'], {
        cwd: this.projectPath,
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
      
      // Send test request
      mcpProcess.stdin.write(JSON.stringify(request) + '\n');
      mcpProcess.stdin.end();
    });
  }

  async generateDifyConfig() {
    console.log('\n⚙️  Step 4: Generating Dify.ai configuration...');
    
    const config = {
      mcp_server: {
        command: 'node simple-mcp-server.js',
        working_directory: this.projectPath,
        environment_variables: {
          MONDAY_API_TOKEN: process.env.MONDAY_API_TOKEN,
          MONDAY_BOARD_ID: process.env.MONDAY_BOARD_ID,
          EMAIL_COLUMN_ID: process.env.EMAIL_COLUMN_ID || 'email_mktp3awp'
        }
      },
      available_tools: [
        'get_board_items_by_name',
        'change_item_column_values', 
        'get_board_schema'
      ],
      test_commands: [
        'Find item named 1',
        'Update email for item 1 to test@example.com',
        'Get board schema'
      ]
    };
    
    const configFile = path.join(this.projectPath, 'dify-config.json');
    fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
    
    console.log('✅ Dify.ai configuration generated');
    console.log(`   - Config file: ${configFile}`);
  }

  provideSetupInstructions() {
    console.log('\n📋 Step 5: Dify.ai Setup Instructions');
    console.log('=====================================');
    console.log('');
    console.log('🎯 Quick Setup (Copy & Paste):');
    console.log('');
    console.log('1. In Dify.ai, go to your agent settings');
    console.log('2. Click "Add Tool"');
    console.log('3. Select "MCP Server"');
    console.log('4. Configure with these exact settings:');
    console.log('');
    console.log(`   Command: node simple-mcp-server.js`);
    console.log(`   Working Directory: ${this.projectPath}`);
    console.log('');
    console.log('5. Add Environment Variables:');
    console.log(`   MONDAY_API_TOKEN: ${process.env.MONDAY_API_TOKEN}`);
    console.log(`   MONDAY_BOARD_ID: ${process.env.MONDAY_BOARD_ID}`);
    if (process.env.EMAIL_COLUMN_ID) {
      console.log(`   EMAIL_COLUMN_ID: ${process.env.EMAIL_COLUMN_ID}`);
    }
    console.log('');
    console.log('🧪 Test Commands:');
    console.log('   - "Find item named 1"');
    console.log('   - "Update email for item 1 to test@example.com"');
    console.log('   - "Get board schema"');
    console.log('');
    console.log('📄 For detailed instructions, see: DIFY_MCP_SETUP.md');
    console.log('');
    console.log('🎉 Your MCP server is ready for Dify.ai integration!');
  }

  async runCommand(command) {
    return new Promise((resolve, reject) => {
      const [cmd, ...args] = command.split(' ');
      const process = spawn(cmd, args, { 
        cwd: this.projectPath,
        stdio: 'inherit'
      });
      
      process.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Command failed with code ${code}`));
        }
      });
    });
  }
}

// Run the automated setup
const setup = new AutomatedSetup();
setup.run().catch(console.error); 