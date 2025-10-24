const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testSparkFunctionality() {
  try {
    console.log('🔍 Testing Spark Functionality...');
    
    // First, let's try to login with an existing user
    console.log('\n1. Attempting to login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'alice@example.com',
      password: 'password123'
    });
    
    if (loginResponse.data.success && loginResponse.data.data && loginResponse.data.data.tokens && loginResponse.data.data.tokens.accessToken) {
      console.log('✅ Login successful!');
      const token = loginResponse.data.data.tokens.accessToken;
      
      // Test discover API to find nearby users
      console.log('\n2. Testing discover API...');
      const discoverResponse = await axios.get(`${BASE_URL}/api/discover`, {
        params: {
          latitude: 23.2257,
          longitude: 77.3867,
          radius: 5
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (discoverResponse.data.success && discoverResponse.data.data.users.length > 0) {
        console.log('✅ Found nearby users:');
        discoverResponse.data.data.users.forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.name} - ${user.distance.km}km away (ID: ${user.id})`);
        });
        
        // Get the first nearby user (Rahul Verma)
        const nearbyUser = discoverResponse.data.data.users[0];
        console.log(`\n3. Testing spark sending to ${nearbyUser.name} (ID: ${nearbyUser.id})...`);
        
        // Test sending a spark
        const sparkResponse = await axios.post(`${BASE_URL}/api/sparks/send`, {
          receiverId: nearbyUser.id,
          message: 'Hey! I noticed we have similar interests in coding and music. Would you like to connect?'
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (sparkResponse.data.success) {
          console.log('✅ Spark sent successfully!');
          console.log(`   Spark ID: ${sparkResponse.data.data.spark_id}`);
          console.log(`   Message: ${sparkResponse.data.data.message || 'No message'}`);
        } else {
          console.log('❌ Failed to send spark:', sparkResponse.data.message);
        }
        
        // Test getting pending sparks
        console.log('\n4. Testing pending sparks...');
        const pendingResponse = await axios.get(`${BASE_URL}/api/sparks/pending`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (pendingResponse.data.success) {
          console.log('✅ Pending sparks retrieved:');
          console.log(`   Count: ${pendingResponse.data.data.length}`);
          pendingResponse.data.data.forEach((spark, index) => {
            console.log(`   ${index + 1}. From: ${spark.sender_name} - ${spark.message || 'No message'}`);
          });
        } else {
          console.log('❌ Failed to get pending sparks:', pendingResponse.data.message);
        }
        
      } else {
        console.log('❌ No nearby users found');
      }
      
    } else {
      console.log('❌ Login failed:', loginResponse.data.message);
      
      // Try to register a new user
      console.log('\n2. Attempting to register a new user...');
      const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, {
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'password123',
        age: 25,
        city: 'Bhopal',
        interests: ['coding', 'music', 'sports']
      });
      
      if (registerResponse.data.success) {
        console.log('✅ User registered successfully!');
        console.log('Please run the test again to login with the new user.');
      } else {
        console.log('❌ Registration failed:', registerResponse.data.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing spark functionality:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testSparkFunctionality();
