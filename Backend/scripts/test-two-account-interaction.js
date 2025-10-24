const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Test accounts data
const account1 = {
  name: 'Alex Johnson',
  email: 'alex.johnson@test.com',
  password: 'password123',
  age: 25,
  city: 'Bhopal',
  interests: ['coding', 'music', 'gaming'],
  latitude: 23.2257,
  longitude: 77.3867
};

const account2 = {
  name: 'Sarah Wilson',
  email: 'sarah.wilson@test.com', 
  password: 'password123',
  age: 23,
  city: 'Bhopal',
  interests: ['music', 'art', 'travel'],
  latitude: 23.2387, // Close to Alex (about 1.5km away)
  longitude: 77.3997
};

let account1Token = null;
let account2Token = null;
let sparkId = null;

async function createTestAccounts() {
  console.log('🔍 Setting up 2 test accounts...');
  
  try {
    // Try to login Account 1 first
    console.log('\n1. Attempting to login Account 1 (Alex Johnson)...');
    try {
      const login1Response = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: account1.email,
        password: account1.password
      });
      
      if (login1Response.data.success && login1Response.data.data.tokens) {
        account1Token = login1Response.data.data.tokens.accessToken;
        console.log('✅ Account 1 logged in successfully!');
      }
    } catch (error) {
      // If login fails, try to register
      console.log('   Login failed, attempting to register...');
      const register1Response = await axios.post(`${BASE_URL}/api/auth/register`, account1);
      
      if (register1Response.data.success) {
        console.log('✅ Account 1 created successfully!');
        
        // Login Account 1
        const login1Response = await axios.post(`${BASE_URL}/api/auth/login`, {
          email: account1.email,
          password: account1.password
        });
        
        if (login1Response.data.success && login1Response.data.data.tokens) {
          account1Token = login1Response.data.data.tokens.accessToken;
          console.log('✅ Account 1 logged in successfully!');
        }
      } else {
        console.log('❌ Account 1 creation failed:', register1Response.data.message);
      }
    }
    
    // Try to login Account 2 first
    console.log('\n2. Attempting to login Account 2 (Sarah Wilson)...');
    try {
      const login2Response = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: account2.email,
        password: account2.password
      });
      
      if (login2Response.data.success && login2Response.data.data.tokens) {
        account2Token = login2Response.data.data.tokens.accessToken;
        console.log('✅ Account 2 logged in successfully!');
      }
    } catch (error) {
      // If login fails, try to register
      console.log('   Login failed, attempting to register...');
      const register2Response = await axios.post(`${BASE_URL}/api/auth/register`, account2);
      
      if (register2Response.data.success) {
        console.log('✅ Account 2 created successfully!');
        
        // Login Account 2
        const login2Response = await axios.post(`${BASE_URL}/api/auth/login`, {
          email: account2.email,
          password: account2.password
        });
        
        if (login2Response.data.success && login2Response.data.data.tokens) {
          account2Token = login2Response.data.data.tokens.accessToken;
          console.log('✅ Account 2 logged in successfully!');
        }
      } else {
        console.log('❌ Account 2 creation failed:', register2Response.data.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error setting up accounts:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

async function testSparkSending() {
  console.log('\n🔍 Testing Spark Sending from Account 1 to Account 2...');
  
  if (!account1Token) {
    console.log('❌ Account 1 not logged in');
    return;
  }
  
  try {
    // First, discover nearby users from Account 1's perspective
    console.log('\n1. Discovering nearby users from Account 1...');
    const discoverResponse = await axios.get(`${BASE_URL}/api/discover`, {
      params: {
        latitude: account1.latitude,
        longitude: account1.longitude,
        radius: 5
      },
      headers: {
        'Authorization': `Bearer ${account1Token}`
      }
    });
    
    if (discoverResponse.data.success && discoverResponse.data.data.users.length > 0) {
      console.log('✅ Found nearby users:');
      discoverResponse.data.data.users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} - ${user.distance.km}km away (ID: ${user.id})`);
      });
      
      // Find Sarah in the results
      const sarah = discoverResponse.data.data.users.find(user => user.name === 'Sarah Wilson');
      if (sarah) {
        console.log(`\n2. Sending spark to ${sarah.name} (ID: ${sarah.id})...`);
        
        const sparkResponse = await axios.post(`${BASE_URL}/api/sparks/send`, {
          receiverId: sarah.id,
          message: 'Hey Sarah! I noticed we both love music. Would you like to connect?'
        }, {
          headers: {
            'Authorization': `Bearer ${account1Token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (sparkResponse.data.success) {
          console.log('✅ Spark sent successfully!');
          sparkId = sparkResponse.data.data.spark_id;
          console.log(`   Spark ID: ${sparkId}`);
          console.log(`   Message: ${sparkResponse.data.data.message || 'No message'}`);
        } else {
          console.log('❌ Failed to send spark:', sparkResponse.data.message);
        }
      } else {
        console.log('❌ Sarah not found in nearby users');
      }
    } else {
      console.log('❌ No nearby users found');
    }
    
  } catch (error) {
    console.error('❌ Error in spark sending test:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

async function testSparkReceivingAndAccepting() {
  console.log('\n🔍 Testing Spark Receiving and Accepting by Account 2...');
  
  if (!account2Token) {
    console.log('❌ Account 2 not logged in');
    return;
  }
  
  try {
    // Check pending sparks for Account 2
    console.log('\n1. Checking pending sparks for Account 2...');
    const pendingResponse = await axios.get(`${BASE_URL}/api/sparks/pending`, {
      headers: {
        'Authorization': `Bearer ${account2Token}`
      }
    });
    
    if (pendingResponse.data.success) {
      console.log('✅ Pending sparks retrieved:');
      console.log(`   Count: ${pendingResponse.data.data.length}`);
      
      if (pendingResponse.data.data.length > 0) {
        const spark = pendingResponse.data.data[0];
        console.log(`   Spark from: ${spark.sender_name}`);
        console.log(`   Message: ${spark.message || 'No message'}`);
        console.log(`   Spark ID: ${spark.id}`);
        
        // Accept the spark
        console.log('\n2. Accepting the spark...');
        const acceptResponse = await axios.post(`${BASE_URL}/api/sparks/${spark.id}/accept`, {}, {
          headers: {
            'Authorization': `Bearer ${account2Token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (acceptResponse.data.success) {
          console.log('✅ Spark accepted successfully!');
          console.log(`   Status: ${acceptResponse.data.data.status}`);
        } else {
          console.log('❌ Failed to accept spark:', acceptResponse.data.message);
        }
      } else {
        console.log('❌ No pending sparks found');
      }
    } else {
      console.log('❌ Failed to get pending sparks:', pendingResponse.data.message);
    }
    
  } catch (error) {
    console.error('❌ Error in spark receiving test:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

async function testChatConnection() {
  console.log('\n🔍 Testing Chat Connection Establishment...');
  
  if (!account1Token || !account2Token) {
    console.log('❌ One or both accounts not logged in');
    return;
  }
  
  try {
    // Check chats for Account 1
    console.log('\n1. Checking chats for Account 1...');
    const chats1Response = await axios.get(`${BASE_URL}/api/chat/user/chats`, {
      headers: {
        'Authorization': `Bearer ${account1Token}`
      }
    });
    
    if (chats1Response.data.success) {
      console.log('✅ Account 1 chats retrieved:');
      console.log(`   Count: ${chats1Response.data.data.length}`);
      chats1Response.data.data.forEach((chat, index) => {
        console.log(`   ${index + 1}. Chat ID: ${chat.id}, Type: ${chat.chat_type}`);
        if (chat.participants) {
          console.log(`      Participants: ${chat.participants.map(p => p.name).join(', ')}`);
        }
      });
    }
    
    // Check chats for Account 2
    console.log('\n2. Checking chats for Account 2...');
    const chats2Response = await axios.get(`${BASE_URL}/api/chat/user/chats`, {
      headers: {
        'Authorization': `Bearer ${account2Token}`
      }
    });
    
    if (chats2Response.data.success) {
      console.log('✅ Account 2 chats retrieved:');
      console.log(`   Count: ${chats2Response.data.data.length}`);
      chats2Response.data.data.forEach((chat, index) => {
        console.log(`   ${index + 1}. Chat ID: ${chat.id}, Type: ${chat.chat_type}`);
        if (chat.participants) {
          console.log(`      Participants: ${chat.participants.map(p => p.name).join(', ')}`);
        }
      });
    }
    
    // Test getting chat details if chat exists
    if (chats1Response.data.success && chats1Response.data.data.length > 0) {
      const chat = chats1Response.data.data[0];
      console.log(`\n3. Testing chat details for chat ${chat.id}...`);
      
      try {
        const chatDetailsResponse = await axios.get(`${BASE_URL}/api/chat/chats/${chat.id}`, {
          headers: {
            'Authorization': `Bearer ${account1Token}`
          }
        });
        
        if (chatDetailsResponse.data.success) {
          console.log('✅ Chat details retrieved successfully!');
          console.log(`   Chat ID: ${chatDetailsResponse.data.data.id}`);
          console.log(`   Chat Type: ${chatDetailsResponse.data.data.chat_type}`);
          console.log(`   Participants: ${chatDetailsResponse.data.data.participants?.map(p => p.name).join(', ')}`);
          console.log(`   Messages Count: ${chatDetailsResponse.data.data.messages?.length || 0}`);
        } else {
          console.log('❌ Failed to get chat details:', chatDetailsResponse.data.message);
        }
      } catch (error) {
        console.log('❌ Error getting chat details:', error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error in chat connection test:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

async function runCompleteTest() {
  console.log('🚀 Starting Complete Two-Account Interaction Test');
  console.log('================================================');
  
  // Step 1: Create accounts
  await createTestAccounts();
  
  if (account1Token && account2Token) {
    // Step 2: Test spark sending
    await testSparkSending();
    
    // Step 3: Test spark receiving and accepting
    await testSparkReceivingAndAccepting();
    
    // Step 4: Test chat connection
    await testChatConnection();
    
    console.log('\n🎉 Complete interaction test finished!');
  } else {
    console.log('❌ Could not complete test - missing authentication tokens');
  }
}

runCompleteTest();
