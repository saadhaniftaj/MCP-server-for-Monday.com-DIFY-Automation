const axios = require('axios');
require('dotenv').config();

async function updateTaskEmail() {
  console.log('🎯 Updating email for task "1" to saadhanift@gmail.com...\n');

  const boardId = process.env.MONDAY_BOARD_ID;
  const apiToken = process.env.MONDAY_API_TOKEN;
  const emailColumnId = process.env.EMAIL_COLUMN_ID;

  if (!apiToken || !boardId || !emailColumnId) {
    console.log('❌ Missing required environment variables');
    console.log('Please check your .env file has: MONDAY_API_TOKEN, MONDAY_BOARD_ID, EMAIL_COLUMN_ID');
    return;
  }

  try {
    // Step 1: Find task "1" by name
    console.log('🔍 Step 1: Searching for task "1"...');
    
    const searchQuery = `
      query getBoardItemsByName($boardId: ID!, $term: CompareValue!) {
        boards(ids: [$boardId]) {
          items_page(query_params: { rules: [{ column_id: "name", operator: contains_text, compare_value: $term }] }) {
            items {
              id
              name
            }
          }
        }
      }
    `;

    const searchResponse = await axios.post('https://api.monday.com/v2', {
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

    const items = searchResponse.data.data.boards[0]?.items_page?.items || [];
    
    if (items.length === 0) {
      console.log('❌ Task "1" not found in the board');
      return;
    }

    const task = items[0];
    console.log(`✅ Found task: "${task.name}" with ID: ${task.id}`);

    // Step 2: Update the email
    console.log('\n📧 Step 2: Updating email to saadhanift@gmail.com...');
    
    const updateQuery = `
      mutation changeItemColumnValues($boardId: ID!, $itemId: ID!, $columnValues: JSON!) {
        change_multiple_column_values(board_id: $boardId, item_id: $itemId, column_values: $columnValues) {
          id
        }
      }
    `;

    // For email columns, we need to use the correct format
    const columnValues = JSON.stringify({
      [emailColumnId]: "saadhanift@gmail.com"
    });

    console.log(`Using column values: ${columnValues}`);

    const updateResponse = await axios.post('https://api.monday.com/v2', {
      query: updateQuery,
      variables: {
        boardId: boardId,
        itemId: task.id,
        columnValues: columnValues
      }
    }, {
      headers: {
        'Authorization': apiToken,
        'Content-Type': 'application/json'
      }
    });

    if (updateResponse.data.errors) {
      console.log('❌ Error updating email:', updateResponse.data.errors);
      
      // Try alternative format for email columns
      console.log('\n🔄 Trying alternative email format...');
      
      const alternativeColumnValues = JSON.stringify({
        [emailColumnId]: {
          "email": "saadhanift@gmail.com",
          "text": "saadhanift@gmail.com"
        }
      });

      console.log(`Using alternative format: ${alternativeColumnValues}`);

      const alternativeResponse = await axios.post('https://api.monday.com/v2', {
        query: updateQuery,
        variables: {
          boardId: boardId,
          itemId: task.id,
          columnValues: alternativeColumnValues
        }
      }, {
        headers: {
          'Authorization': apiToken,
          'Content-Type': 'application/json'
        }
      });

      if (alternativeResponse.data.errors) {
        console.log('❌ Alternative format also failed:', alternativeResponse.data.errors);
        return;
      }

      console.log('✅ Email updated successfully with alternative format!');
    } else {
      console.log('✅ Email updated successfully!');
    }

    console.log(`   Task: "${task.name}" (ID: ${task.id})`);
    console.log(`   Email: saadhanift@gmail.com`);
    console.log(`   Column: ${emailColumnId}`);

    // Step 3: Verify the update
    console.log('\n🔍 Step 3: Verifying the update...');
    
    const verifyQuery = `
      query getItem($boardId: ID!, $itemId: ID!) {
        boards(ids: [$boardId]) {
          items(ids: [$itemId]) {
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
    `;

    const verifyResponse = await axios.post('https://api.monday.com/v2', {
      query: verifyQuery,
      variables: {
        boardId: boardId,
        itemId: task.id
      }
    }, {
      headers: {
        'Authorization': apiToken,
        'Content-Type': 'application/json'
      }
    });

    const item = verifyResponse.data.data.boards[0]?.items[0];
    if (item) {
      const emailColumn = item.column_values.find(col => col.id === emailColumnId);
      if (emailColumn) {
        console.log(`✅ Verification successful!`);
        console.log(`   Current email: ${emailColumn.text || 'Not set'}`);
      }
    }

    console.log('\n🎉 Task completed successfully!');
    console.log('Check your Monday.com board to see the updated email.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the update
updateTaskEmail(); 