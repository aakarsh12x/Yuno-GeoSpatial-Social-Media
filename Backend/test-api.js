const http = require('http');
const https = require('https');

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
function makeRequest(method, path, token = null) {
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

    const httpModule = options.hostname.startsWith('localhost') ? http : https;
    
    const req = httpModule.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const responseData = data ? JSON.parse(data) : {};
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: responseData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data,
            parseError: error.message
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.end();
  });
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
    const response = await makeRequest('POST', '/api/auth/register', null, userData);
    if (response.statusCode === 201 && response.data.token) {
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

// Main function
async function testAPI() {
  console.log(`${colors.cyan}🚀 Testing Yuno Backend API${colors.reset}`);
  console.log(`${colors.cyan}=======================${colors.reset}`);
  console.log(`${colors.blue}Server: ${config.host}:${config.port}${colors.reset}`);
  console.log();
  
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
  console.log(`${colors.yellow}⚠️  These tests will fail without authentication${colors.reset}`);
  console.log(`${colors.yellow}⚠️  Register a user first to test these endpoints${colors.reset}`);
  console.log();
  
  for (const endpoint of config.authEndpoints) {
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
  
  console.log(`${colors.cyan}API Testing Complete${colors.reset}`);
}

// Run the tests
testAPI().catch(error => {
  console.error(`${colors.red}❌ Test failed: ${error.message}${colors.reset}`);
});
