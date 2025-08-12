const axios = require('axios');
require('dotenv').config();

async function verifyEmail() {
  console.log('🔍 Verifying email update for task "1"...\n');

  const boardId = process.env.MONDAY_BOARD_ID;
  const apiToken = process.env.MONDAY_API_TOKEN;
  const emailColumnId = process.env.EMAIL_COLUMN_ID;

  try {
    // Find task "1"
    const searchQuery = `
      query getBoardItemsByName($boardId: ID!, $term: CompareValue!) {
        boards(ids: [$boardId]) {
          items_page(query_params: { rules: [{ column_id: "name", operator: contains_text, compare_value: $term }] }) {
            items {
              id
              name
              column_values {
                id
                value
                text
              }
            }
          }
        }
      }
    `;

    const response = await axios.post('https://api.monday.com/v2', {
      query: searchQuery,
      variables: { 
        boardId: boardId,
        term: "1"
      }
    }, {
      headers: {
        'Authorization': apiToken,
        'Content-Type': 'application/json'
      }
    });

    const items = response.data.data.boards[0]?.items_page?.items || [];
    
    if (items.length === 0) {
      console.log('❌ Task "1" not found');
      return;
    }

    const task = items[0];
    console.log(`✅ Found task: "${task.name}" (ID: ${task.id})`);

    // Find the email column
    const emailColumn = task.column_values.find(col => col.id === emailColumnId);
    
    if (emailColumn) {
      console.log(`📧 Email column found: ${emailColumnId}`);
      console.log(`   Current value: ${emailColumn.text || 'Not set'}`);
      console.log(`   Raw value: ${emailColumn.value || 'Not set'}`);
      
      if (emailColumn.text === 'saadhanift@gmail.com') {
        console.log('\n🎉 SUCCESS! Email was updated correctly!');
        console.log('   The email field now shows: saadhanift@gmail.com');
      } else {
        console.log('\n⚠️  Email was not updated as expected');
        console.log(`   Expected: saadhanift@gmail.com`);
        console.log(`   Found: ${emailColumn.text}`);
      }
    } else {
      console.log(`❌ Email column ${emailColumnId} not found`);
    }

    console.log('\n📋 All column values for this task:');
    task.column_values.forEach(col => {
      console.log(`   ${col.id}: ${col.text || 'Not set'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run verification
verifyEmail(); 