const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setup() {
  console.log('🚀 Monday.com MCP Server Setup\n');
  
  try {
    // Check if .env file exists
    const envPath = path.join(__dirname, '.env');
    const envExists = fs.existsSync(envPath);
    
    if (envExists) {
      const overwrite = await question('⚠️  .env file already exists. Overwrite? (y/N): ');
      if (overwrite.toLowerCase() !== 'y') {
        console.log('Setup cancelled.');
        rl.close();
        return;
      }
    }
    
    console.log('Please provide the following information:\n');
    
    // Get Monday.com API token
    const apiToken = await question('Monday.com API Token: ');
    if (!apiToken) {
      console.log('❌ API token is required.');
      rl.close();
      return;
    }
    
    // Get board ID
    const boardId = await question('Monday.com Board ID: ');
    if (!boardId) {
      console.log('❌ Board ID is required.');
      rl.close();
      return;
    }
    
    // Get email column ID
    const emailColumnId = await question('Email Column ID (optional, can be set later): ');
    
    // Get port
    const port = await question('Server Port (default: 3000): ') || '3000';
    
    // Create .env content
    const envContent = `# Monday.com API Configuration
MONDAY_API_TOKEN=${apiToken}
MONDAY_BOARD_ID=${boardId}
MONDAY_API_VERSION=v2024-01

# Server Configuration
PORT=${port}

# Email Column ID (you need to find this from your Monday.com board)
EMAIL_COLUMN_ID=${emailColumnId || 'your_email_column_id_here'}
`;
    
    // Write .env file
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ .env file created successfully!');
    
    // Test the configuration
    console.log('\n🧪 Testing configuration...');
    
    // Load environment variables
    require('dotenv').config();
    
    // Test API token format (basic validation)
    if (apiToken.length < 10) {
      console.log('⚠️  Warning: API token seems too short. Please verify it\'s correct.');
    } else {
      console.log('✅ API token format looks good.');
    }
    
    // Test board ID format
    if (isNaN(boardId)) {
      console.log('⚠️  Warning: Board ID should be a number.');
    } else {
      console.log('✅ Board ID format looks good.');
    }
    
    console.log('\n📋 Next Steps:');
    console.log('1. Install dependencies: npm install');
    console.log('2. Start the server: npm start');
    console.log('3. Test the server: npm test');
    console.log('4. Install ngrok: npm install -g ngrok');
    console.log('5. Expose server: ngrok http 3000');
    console.log('6. Configure Dify.ai with the ngrok URL');
    
    if (!emailColumnId) {
      console.log('\n⚠️  Note: You still need to set EMAIL_COLUMN_ID in your .env file.');
      console.log('   Use the /board-schema/:boardId endpoint to find column IDs.');
    }
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

// Run setup
setup(); 