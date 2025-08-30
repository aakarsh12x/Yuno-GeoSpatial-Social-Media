/**
 * Script to run the server with database connection
 * 
 * Usage:
 * node run-with-db.js [connection-string]
 * 
 * If connection-string is provided, it will be used as the DATABASE_URL
 * Otherwise, it will use the DATABASE_URL from the .env file
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Get connection string from command line argument
const connectionString = process.argv[2];

// If connection string is provided, update the .env file
if (connectionString) {
  console.log('🔧 Using provided connection string...');
  
  // Check if .env file exists
  const envPath = path.join(__dirname, '.env');
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    // Read existing .env file
    envContent = fs.readFileSync(envPath, 'utf8');
    
    // Replace or add DATABASE_URL
    if (envContent.includes('DATABASE_URL=')) {
      envContent = envContent.replace(/DATABASE_URL=.*(\r?\n|$)/g, `DATABASE_URL=${connectionString}$1`);
    } else {
      envContent = `DATABASE_URL=${connectionString}\n${envContent}`;
    }
  } else {
    // Create new .env file
    envContent = `DATABASE_URL=${connectionString}
JWT_SECRET=yuno-super-secret-jwt-key-for-development-2025
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
`;
  }
  
  // Write updated .env file
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Updated .env file with connection string');
}

// Start the server
console.log('🚀 Starting Yuno Backend Server...');

const server = spawn('node', ['server.js'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'development'
  }
});

// Handle server process events
server.on('error', (error) => {
  console.error('❌ Server error:', error.message);
  process.exit(1);
});

server.on('close', (code) => {
  if (code !== 0) {
    console.error(`❌ Server process exited with code ${code}`);
    process.exit(code);
  }
});
