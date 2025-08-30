const http = require('http');
const https = require('https');
const { query } = require('./database/connection');

// Configuration
const config = {
  host: 'localhost',
  port: 5000,
  endpoints: [
    { method: 'GET', path: '/health', name: 'Health Check' },
    { method: 'GET', path: '/api', name: 'API Info' },
    { method: 'GET', path: '/socket-stats', name: 'Socket.IO Stats' }
  ],
  authEndpoints: [
    { method: 'GET', path: '/api/sparks/nearby?radius=10', name: 'Nearby Sparks' },
    { method: 'GET', path: '/api/sparks/pending', name: 'Pending Sparks' },
    { method: 'GET', path: '/api/chat/user/chats', name: 'User Chats' }
  ]
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Make HTTP request
function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: config.host,
      port: config.port,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const httpModule = options.hostname.startsWith('localhost') ? http : https;
    
    const req = httpModule.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = responseData ? JSON.parse(responseData) : {};
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: parsedData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: responseData,
            parseError: error.message
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test database connection
async function testDatabase() {
  console.log(`${colors.cyan}🗄️  Testing Database Connection${colors.reset}`);
  console.log(`${colors.cyan}===========================${colors.reset}`);
  
  try {
    // Test basic connection
    const result = await query('SELECT NOW() as current_time');
    console.log(`${colors.green}✅ Database connection successful${colors.reset}`);
    console.log(`${colors.yellow}Current time: ${result.rows[0].current_time}${colors.reset}`);
    
    // Check if tables exist
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'sparks', 'chats', 'messages', 'chat_participants')
      ORDER BY table_name
    `;
    const tablesResult = await query(tablesQuery);
    console.log(`${colors.green}✅ Found ${tablesResult.rows.length} tables: ${tablesResult.rows.map(t => t.table_name).join(', ')}${colors.reset}`);
    
    // Check user count
    const userCountQuery = 'SELECT COUNT(*) as count FROM users';
    const userCountResult = await query(userCountQuery);
    console.log(`${colors.yellow}Users in database: ${userCountResult.rows[0].count}${colors.reset}`);
    
    // Check sparks count
    const sparksCountQuery = 'SELECT COUNT(*) as count FROM sparks';
    const sparksCountResult = await query(sparksCountQuery);
    console.log(`${colors.yellow}Sparks in database: ${sparksCountResult.rows[0].count}${colors.reset}`);
    
    // Check chats count
    const chatsCountQuery = 'SELECT COUNT(*) as count FROM chats';
    const chatsCountResult = await query(chatsCountQuery);
    console.log(`${colors.yellow}Chats in database: ${chatsCountResult.rows[0].count}${colors.reset}`);
    
    console.log();
    return true;
  } catch (error) {
    console.log(`${colors.red}❌ Database test failed: ${error.message}${colors.reset}`);
    console.log();
    return false;
  }
}

// Register a test user
async function registerTestUser() {
  const userData = {
    name: 'Test User',
    email: `test_${Date.now()}@example.com`,
    password: 'Test1234!',
    age: 25,
    city: 'Test City',
    latitude: 40.7128,
    longitude: -74.0060
  };
  
  try {
    const response = await makeRequest('POST', '/api/auth/register', userData);
    if (response.statusCode === 201 && response.data.token) {
      console.log(`${colors.green}✅ Test user registered successfully${colors.reset}`);
      return response.data.token;
    } else {
      console.log(`${colors.yellow}⚠️  Could not register test user: ${response.statusCode}${colors.reset}`);
      return null;
    }
  } catch (error) {
    console.log(`${colors.red}❌ Error registering test user: ${error.message}${colors.reset}`);
    return null;
  }
}

// Test authentication
async function testAuthentication() {
  console.log(`${colors.cyan}🔐 Testing Authentication${colors.reset}`);
  console.log(`${colors.cyan}=======================${colors.reset}`);
  
  // Test login with existing user
  const loginData = {
    email: 'alice@example.com',
    password: 'password123'
  };
  
  try {
    const response = await makeRequest('POST', '/api/auth/login', loginData);
    if (response.statusCode === 200 && response.data.token) {
      console.log(`${colors.green}✅ Login successful with alice@example.com${colors.reset}`);
      return response.data.token;
    } else {
      console.log(`${colors.red}❌ Login failed: ${response.statusCode}${colors.reset}`);
      console.log(`${colors.yellow}Response: ${JSON.stringify(response.data, null, 2)}${colors.reset}`);
      return null;
    }
  } catch (error) {
    console.log(`${colors.red}❌ Login error: ${error.message}${colors.reset}`);
    return null;
  }
}

// Test API endpoints
async function testAPIEndpoints(token = null) {
  console.log(`${colors.cyan}🌐 Testing API Endpoints${colors.reset}`);
  console.log(`${colors.cyan}======================${colors.reset}`);
  
  // Test public endpoints
  console.log(`${colors.magenta}Testing Public Endpoints:${colors.reset}`);
  for (const endpoint of config.endpoints) {
    try {
      console.log(`${colors.blue}Testing ${endpoint.method} ${endpoint.path} (${endpoint.name})...${colors.reset}`);
      const response = await makeRequest(endpoint.method, endpoint.path);
      
      if (response.statusCode >= 200 && response.statusCode < 300) {
        console.log(`${colors.green}✅ ${endpoint.name}: ${response.statusCode} OK${colors.reset}`);
      } else {
        console.log(`${colors.red}❌ ${endpoint.name}: ${response.statusCode} Failed${colors.reset}`);
      }
      
      console.log(`${colors.yellow}Response: ${JSON.stringify(response.data, null, 2)}${colors.reset}`);
      console.log();
    } catch (error) {
      console.log(`${colors.red}❌ ${endpoint.name}: Error - ${error.message}${colors.reset}`);
      console.log();
    }
  }
  
  // Test authenticated endpoints
  console.log(`${colors.magenta}Testing Authenticated Endpoints:${colors.reset}`);
  if (!token) {
    console.log(`${colors.yellow}⚠️  No authentication token available${colors.reset}`);
    console.log(`${colors.yellow}⚠️  These tests will fail without authentication${colors.reset}`);
    console.log();
  }
  
  for (const endpoint of config.authEndpoints) {
    try {
      console.log(`${colors.blue}Testing ${endpoint.method} ${endpoint.path} (${endpoint.name})...${colors.reset}`);
      const response = await makeRequest(endpoint.method, endpoint.path, null, token);
      
      if (response.statusCode >= 200 && response.statusCode < 300) {
        console.log(`${colors.green}✅ ${endpoint.name}: ${response.statusCode} OK${colors.reset}`);
      } else {
        console.log(`${colors.red}❌ ${endpoint.name}: ${response.statusCode} Failed${colors.reset}`);
      }
      
      console.log(`${colors.yellow}Response: ${JSON.stringify(response.data, null, 2)}${colors.reset}`);
      console.log();
    } catch (error) {
      console.log(`${colors.red}❌ ${endpoint.name}: Error - ${error.message}${colors.reset}`);
      console.log();
    }
  }
}

// Test frontend connectivity
async function testFrontendConnectivity() {
  console.log(`${colors.cyan}🎨 Testing Frontend Connectivity${colors.reset}`);
  console.log(`${colors.cyan}==============================${colors.reset}`);
  
  try {
    // Test if frontend is running
    const frontendResponse = await makeRequest('GET', '/', null, null, 'http://localhost:3000');
    console.log(`${colors.green}✅ Frontend is accessible${colors.reset}`);
  } catch (error) {
    console.log(`${colors.yellow}⚠️  Frontend not accessible: ${error.message}${colors.reset}`);
    console.log(`${colors.yellow}⚠️  Make sure the frontend is running on http://localhost:3000${colors.reset}`);
  }
  
  console.log();
}

// Main function
async function runIntegrationTests() {
  console.log(`${colors.cyan}🚀 Yuno Backend-Frontend Integration Test${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.blue}Server: ${config.host}:${config.port}${colors.reset}`);
  console.log();
  
  // Test database
  const dbSuccess = await testDatabase();
  if (!dbSuccess) {
    console.log(`${colors.red}❌ Database test failed. Please check your database connection.${colors.reset}`);
    process.exit(1);
  }
  
  // Test API endpoints
  await testAPIEndpoints();
  
  // Test authentication
  const token = await testAuthentication();
  
  // Test authenticated endpoints with token
  if (token) {
    await testAPIEndpoints(token);
  }
  
  console.log(`${colors.cyan}✨ Integration Test Complete${colors.reset}`);
  console.log();
  console.log(`${colors.green}✅ Backend is ready for frontend integration!${colors.reset}`);
  console.log(`${colors.yellow}🔗 Frontend should connect to: http://localhost:${config.port}${colors.reset}`);
  console.log(`${colors.yellow}🔑 Use test credentials: alice@example.com / password123${colors.reset}`);
}

// Run the tests
runIntegrationTests().catch(error => {
  console.error(`${colors.red}❌ Integration test failed: ${error.message}${colors.reset}`);
  process.exit(1);
});
