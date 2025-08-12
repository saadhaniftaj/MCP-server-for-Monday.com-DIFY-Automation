const axios = require('axios');
require('dotenv').config();

async function getColumnIds() {
  console.log('🔍 Getting column IDs from Monday.com...\n');

  // Check if we have the required environment variables
  if (!process.env.MONDAY_API_TOKEN) {
    console.log('❌ MONDAY_API_TOKEN not found in .env file');
    console.log('Please add your Monday.com API token to the .env file');
    return;
  }

  if (!process.env.MONDAY_BOARD_ID) {
    console.log('❌ MONDAY_BOARD_ID not found in .env file');
    console.log('Please add your Monday.com board ID to the .env file');
    return;
  }

  const boardId = process.env.MONDAY_BOARD_ID;
  const apiToken = process.env.MONDAY_API_TOKEN;

  // GraphQL query to get board schema
  const query = `
    query getBoardSchema($boardId: ID!) {
      boards(ids: [$boardId]) {
        columns {
          id
          title
          type
        }
      }
    }
  `;

  try {
    console.log(`📋 Fetching columns for board ${boardId}...`);
    
    const response = await axios.post('https://api.monday.com/v2', {
      query: query,
      variables: { boardId: boardId }
    }, {
      headers: {
        'Authorization': apiToken,
        'Content-Type': 'application/json'
      }
    });

    const data = response.data;
    
    if (data.errors) {
      console.log('❌ GraphQL errors:', data.errors);
      return;
    }

    const columns = data.data.boards[0]?.columns || [];
    
    if (columns.length === 0) {
      console.log('❌ No columns found in this board');
      return;
    }

    console.log('✅ Found columns:\n');
    console.log('┌─────────────────────────────────────────────────────────────┐');
    console.log('│ Column ID                    │ Title                        │ Type                          │');
    console.log('├─────────────────────────────────────────────────────────────┤');

    columns.forEach(column => {
      const id = column.id.padEnd(30);
      const title = (column.title || 'Untitled').padEnd(30);
      const type = column.type.padEnd(30);
      console.log(`│ ${id} │ ${title} │ ${type} │`);
    });

    console.log('└─────────────────────────────────────────────────────────────┘\n');

    // Find email columns
    const emailColumns = columns.filter(col => 
      col.type === 'email' || 
      col.title.toLowerCase().includes('email') ||
      col.title.toLowerCase().includes('e-mail')
    );

    if (emailColumns.length > 0) {
      console.log('📧 Email columns found:');
      emailColumns.forEach(col => {
        console.log(`   • ${col.title}: ${col.id}`);
      });
      console.log('\n💡 Use one of these IDs as EMAIL_COLUMN_ID in your .env file');
    } else {
      console.log('⚠️  No email columns found');
      console.log('   You may need to create an email column or use a different column type');
    }

    console.log('\n📝 To use a column ID:');
    console.log('1. Copy the column ID you want to use');
    console.log('2. Add it to your .env file as EMAIL_COLUMN_ID');
    console.log('3. Restart the server: npm start');

  } catch (error) {
    console.error('❌ Error fetching column IDs:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your MONDAY_API_TOKEN is correct');
    console.log('2. Verify your MONDAY_BOARD_ID is correct');
    console.log('3. Make sure your API token has read permissions');
    console.log('4. Check that the board is accessible with your account');
  }
}

// Run the script
getColumnIds(); 