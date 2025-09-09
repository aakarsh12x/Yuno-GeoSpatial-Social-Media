const axios = require('axios');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const endpoints = [
  { method: 'GET', path: '/api/health', name: 'Health Check' },
  { method: 'GET', path: '/api', name: 'API Root' },
  { method: 'POST', path: '/api/auth/login', name: 'Login', data: { email: 'test@example.com', password: 'password' } },
  { method: 'POST', path: '/api/auth/register', name: 'Register', data: { email: 'test@example.com', password: 'password', name: 'Test User' } },
  { method: 'POST', path: '/api/auth/refresh', name: 'Token Refresh', data: { refreshToken: 'test-token' } },
  { method: 'POST', path: '/api/auth/logout', name: 'Logout', data: { refreshToken: 'test-token' } },
  { method: 'GET', path: '/api/users/profile', name: 'User Profile' },
  { method: 'PUT', path: '/api/users/profile', name: 'Update Profile', data: { name: 'Updated User' } },
  { method: 'GET', path: '/api/users/1', name: 'User by ID' },
  { method: 'GET', path: '/api/discover', name: 'Discover Users' },
  { method: 'GET', path: '/api/discover/stats', name: 'Discover Stats' },
  { method: 'GET', path: '/api/discover/popular-interests', name: 'Popular Interests' },
  { method: 'GET', path: '/api/chat/chats', name: 'Chat List' },
  { method: 'GET', path: '/api/sparks/nearby', name: 'Nearby Sparks' },
  { method: 'GET', path: '/api/sparks/pending', name: 'Pending Sparks' }
];

async function testEndpoint(endpoint) {
  try {
    const config = {
      method: endpoint.method,
      url: `${BASE_URL}${endpoint.path}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (endpoint.data) {
      config.data = endpoint.data;
    }

    const response = await axios(config);
    
    console.log(`✅ ${endpoint.name} (${endpoint.method} ${endpoint.path})`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Response: ${JSON.stringify(response.data).substring(0, 100)}...`);
    console.log('');
    
    return { success: true, endpoint: endpoint.name };
  } catch (error) {
    console.log(`❌ ${endpoint.name} (${endpoint.method} ${endpoint.path})`);
    console.log(`   Status: ${error.response?.status || 'Network Error'}`);
    console.log(`   Error: ${error.response?.data?.message || error.message}`);
    console.log('');
    
    return { success: false, endpoint: endpoint.name, error: error.message };
  }
}

async function runTests() {
  console.log(`🚀 Testing API endpoints at: ${BASE_URL}`);
  console.log('=' .repeat(60));
  console.log('');

  const results = [];
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('=' .repeat(60));
  console.log('📊 Test Results Summary:');
  console.log('');

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((successful / results.length) * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.log('');
    console.log('❌ Failed Endpoints:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.endpoint}: ${r.error}`);
    });
  }

  console.log('');
  console.log('🎉 Testing complete!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests, testEndpoint };



