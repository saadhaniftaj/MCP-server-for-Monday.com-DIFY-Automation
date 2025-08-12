#!/usr/bin/env node

const { spawn } = require('child_process');
const readline = require('readline');

console.log('🧪 Testing MCP Server...\n');

// Start the MCP server
const mcpServer = spawn('node', ['simple-mcp-server.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let responseCount = 0;
const expectedResponses = 2;

mcpServer.stdout.on('data', (data) => {
  const output = data.toString();
  console.log('📤 MCP Server Output:', output.trim());
  
  // Check if it's a JSON-RPC response
  if (output.includes('"jsonrpc"')) {
    responseCount++;
    console.log(`✅ Received response ${responseCount}/${expectedResponses}`);
    
    if (responseCount >= expectedResponses) {
      console.log('\n🎉 MCP Server is working correctly!');
      console.log('\n📋 For Dify.ai:');
      console.log('1. Go to your Dify.ai agent');
      console.log('2. Add MCP Server tool');
      console.log('3. Set command: node simple-mcp-server.js');
      console.log('4. Set working directory: /Users/applestore/Desktop/aws-fiverr/ww/mcp rampup/monday:defy POC');
      console.log('5. Add environment variables:');
      console.log('   - MONDAY_API_TOKEN: eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjU0ODY3ODQ5MCwiYWFpIjoxMSwidWlkIjo3OTc1MTA4OSwiaWFkIjoiMjAyNS0wOC0xMFQxODozNjowMS4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MzA3NjgxOTgsInJnbiI6ImFwc2UyIn0.vJ3fYdST1pVr_puV6NzIH54UFSH77NiOFoxu0hFCqRs');
      console.log('   - MONDAY_BOARD_ID: 2056518483');
      console.log('   - EMAIL_COLUMN_ID: email_mktp3awp');
      console.log('\n🧪 Test commands:');
      console.log('- "Find item named 1"');
      console.log('- "Update email for item 1 to test@example.com"');
      console.log('- "Get board schema"');
      
      mcpServer.kill();
      process.exit(0);
    }
  }
});

mcpServer.stderr.on('data', (data) => {
  console.log('❌ MCP Server Error:', data.toString());
});

// Send initialize request
setTimeout(() => {
  const initRequest = {
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: {
        name: "test",
        version: "1.0.0"
      }
    }
  };
  
  console.log('📤 Sending initialize request...');
  mcpServer.stdin.write(JSON.stringify(initRequest) + '\n');
  
  // Send tools/list request
  setTimeout(() => {
    const toolsRequest = {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/list",
      params: {}
    };
    
    console.log('📤 Sending tools/list request...');
    mcpServer.stdin.write(JSON.stringify(toolsRequest) + '\n');
  }, 1000);
}, 1000);

// Timeout after 10 seconds
setTimeout(() => {
  console.log('⏰ Test timeout - killing MCP server');
  mcpServer.kill();
  process.exit(1);
}, 10000); 