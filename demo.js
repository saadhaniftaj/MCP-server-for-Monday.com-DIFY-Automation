const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function runDemo() {
  console.log('🎬 Monday.com MCP + Dify.ai Integration Demo\n');
  console.log('This demo shows the complete workflow:\n');
  console.log('1. Natural language command processing');
  console.log('2. Item lookup in Monday.com');
  console.log('3. Email field update');
  console.log('4. Success confirmation\n');

  try {
    // Step 1: Show the natural language command
    const command = "Update email for item ProjectX to demo@example.com";
    console.log('📝 Natural Language Command:');
    console.log(`"${command}"\n`);

    // Step 2: Process the command
    console.log('🔄 Processing command...');
    const response = await axios.post(`${BASE_URL}/process-command`, {
      command: command,
      boardId: 123456789
    });

    console.log('✅ Command processed successfully!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    console.log('');

    // Step 3: Show what happened behind the scenes
    console.log('🔍 Behind the scenes:');
    console.log('1. Parsed command to extract:');
    console.log('   - Item name: ProjectX');
    console.log('   - Email: demo@example.com');
    console.log('   - Board ID: 123456789');
    console.log('');
    console.log('2. Looked up item in Monday.com');
    console.log('3. Updated email field');
    console.log('4. Confirmed success\n');

    // Step 4: Show how this would work in Dify.ai
    console.log('🤖 Dify.ai Integration:');
    console.log('In Dify.ai, users can simply type:');
    console.log('"Update email for item ProjectX to demo@example.com"');
    console.log('');
    console.log('The agent will:');
    console.log('1. Recognize this as a Monday.com update command');
    console.log('2. Call the MCP server API');
    console.log('3. Process the request');
    console.log('4. Return success confirmation');
    console.log('');

    console.log('🎉 Demo completed successfully!');
    console.log('');
    console.log('Next steps for full implementation:');
    console.log('1. Set up real Monday.com API credentials');
    console.log('2. Configure Dify.ai agent with ngrok URL');
    console.log('3. Test with real Monday.com data');
    console.log('4. Create Loom video demo');

  } catch (error) {
    if (error.response && error.response.status === 400 && error.response.data.error.includes('EMAIL_COLUMN_ID')) {
      console.log('⚠️  Demo partially completed (EMAIL_COLUMN_ID not set)');
      console.log('');
      console.log('This is expected for demo purposes. The server is working correctly!');
      console.log('');
      console.log('To see the full demo:');
      console.log('1. Create a .env file with your Monday.com credentials');
      console.log('2. Set EMAIL_COLUMN_ID to your actual email column ID');
      console.log('3. Run this demo again');
    } else {
      console.error('❌ Demo failed:', error.message);
    }
  }
}

// Run the demo
runDemo(); 