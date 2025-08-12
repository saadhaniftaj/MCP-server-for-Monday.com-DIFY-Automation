const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testServer() {
  console.log('🧪 Testing Monday.com MCP Server...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data);
    console.log('');

    // Test 2: Get Board Schema
    console.log('2. Testing board schema endpoint...');
    const boardId = process.env.MONDAY_BOARD_ID || 123456789;
    const schemaResponse = await axios.get(`${BASE_URL}/board-schema/${boardId}`);
    console.log('✅ Board schema test passed:', schemaResponse.data);
    console.log('');

    // Test 3: Natural Language Processing
    console.log('3. Testing natural language processing...');
    try {
      const commandResponse = await axios.post(`${BASE_URL}/process-command`, {
        command: 'Update email for item TestProject to test@example.com',
        boardId: parseInt(boardId)
      });
      console.log('✅ Natural language processing test passed:', commandResponse.data);
    } catch (error) {
      if (error.response && error.response.status === 400 && error.response.data.error.includes('EMAIL_COLUMN_ID')) {
        console.log('⚠️  Natural language processing test skipped (EMAIL_COLUMN_ID not set)');
        console.log('   This is expected for demo purposes. Set EMAIL_COLUMN_ID in .env for full testing.');
      } else {
        throw error;
      }
    }
    console.log('');

    // Test 4: Get Item
    console.log('4. Testing get item endpoint...');
    const getItemResponse = await axios.post(`${BASE_URL}/get-item`, {
      boardId: parseInt(boardId),
      itemName: 'TestProject'
    });
    console.log('✅ Get item test passed:', getItemResponse.data);
    console.log('');

    // Test 5: Update Email
    console.log('5. Testing update email endpoint...');
    try {
      const updateEmailResponse = await axios.post(`${BASE_URL}/update-email`, {
        boardId: parseInt(boardId),
        itemId: 123456,
        email: 'updated@example.com'
      });
      console.log('✅ Update email test passed:', updateEmailResponse.data);
    } catch (error) {
      if (error.response && error.response.status === 400 && error.response.data.error.includes('EMAIL_COLUMN_ID')) {
        console.log('⚠️  Update email test skipped (EMAIL_COLUMN_ID not set)');
        console.log('   This is expected for demo purposes. Set EMAIL_COLUMN_ID in .env for full testing.');
      } else {
        throw error;
      }
    }
    console.log('');

    console.log('🎉 All tests passed! Your server is working correctly.');
    console.log('');
    console.log('Next steps:');
    console.log('1. Install ngrok: npm install -g ngrok');
    console.log('2. Expose your server: ngrok http 3000');
    console.log('3. Configure Dify.ai with the ngrok URL');
    console.log('4. Test with natural language commands in Dify.ai');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    console.log('');
    console.log('Troubleshooting:');
    console.log('1. Make sure the server is running: npm start');
    console.log('2. Check your .env file configuration');
    console.log('3. Verify your Monday.com API token');
    console.log('4. Ensure your board ID and column IDs are correct');
  }
}

// Run tests
testServer(); 