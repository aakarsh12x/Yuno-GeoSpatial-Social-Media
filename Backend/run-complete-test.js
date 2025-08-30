const { spawn } = require('child_process');
const { exec } = require('child_process');

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

console.log(`${colors.cyan}🚀 Yuno Complete Database Integration Test${colors.reset}`);
console.log(`${colors.cyan}==========================================${colors.reset}`);
console.log();

// Function to run a command and return a promise
function runCommand(command, description) {
  return new Promise((resolve, reject) => {
    console.log(`${colors.blue}${description}...${colors.reset}`);
    
    exec(command, { cwd: __dirname }, (error, stdout, stderr) => {
      if (error) {
        console.log(`${colors.red}❌ ${description} failed: ${error.message}${colors.reset}`);
        if (stderr) {
          console.log(`${colors.yellow}Error details: ${stderr}${colors.reset}`);
        }
        reject(error);
      } else {
        console.log(`${colors.green}✅ ${description} completed${colors.reset}`);
        if (stdout) {
          console.log(`${colors.yellow}Output: ${stdout}${colors.reset}`);
        }
        resolve(stdout);
      }
    });
  });
}

// Function to run a command that doesn't exit
function runCommandAsync(command, description) {
  return new Promise((resolve, reject) => {
    console.log(`${colors.blue}${description}...${colors.reset}`);
    
    const child = spawn(command, [], { 
      cwd: __dirname, 
      stdio: 'inherit',
      shell: true 
    });
    
    // Give it some time to start
    setTimeout(() => {
      console.log(`${colors.green}✅ ${description} started${colors.reset}`);
      resolve(child);
    }, 3000);
    
    child.on('error', (error) => {
      console.log(`${colors.red}❌ ${description} failed: ${error.message}${colors.reset}`);
      reject(error);
    });
  });
}

// Main function
async function runCompleteTest() {
  try {
    // Step 1: Run migrations
    await runCommand('npm run migrate', 'Running database migrations');
    
    // Step 2: Seed the database
    await runCommand('npm run seed', 'Seeding database with sample data');
    
    // Step 3: Start the backend server
    console.log(`${colors.blue}Starting backend server...${colors.reset}`);
    const server = await runCommandAsync('npm run dev', 'Starting backend server');
    
    // Step 4: Wait a bit for server to fully start
    console.log(`${colors.yellow}Waiting for server to fully start...${colors.reset}`);
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Step 5: Run integration tests
    await runCommand('npm run test:integration', 'Running integration tests');
    
    console.log();
    console.log(`${colors.cyan}✨ Complete Test Process Finished!${colors.reset}`);
    console.log();
    console.log(`${colors.green}✅ Database is set up and seeded with sample data${colors.reset}`);
    console.log(`${colors.green}✅ Backend server is running on http://localhost:5000${colors.reset}`);
    console.log(`${colors.green}✅ All integration tests passed${colors.reset}`);
    console.log();
    console.log(`${colors.yellow}🔑 Test Credentials:${colors.reset}`);
    console.log(`${colors.yellow}Email: alice@example.com, Password: password123${colors.reset}`);
    console.log(`${colors.yellow}Email: bob@example.com, Password: password123${colors.reset}`);
    console.log(`${colors.yellow}Email: charlie@example.com, Password: password123${colors.reset}`);
    console.log();
    console.log(`${colors.blue}🎨 Next Steps:${colors.reset}`);
    console.log(`${colors.blue}1. Start the frontend: cd ../Frontend && npm run dev${colors.reset}`);
    console.log(`${colors.blue}2. Open http://localhost:3000 in your browser${colors.reset}`);
    console.log(`${colors.blue}3. Test the application with the provided credentials${colors.reset}`);
    console.log();
    console.log(`${colors.magenta}Press Ctrl+C to stop the backend server${colors.reset}`);
    
    // Keep the server running
    server.on('close', (code) => {
      console.log(`${colors.yellow}Backend server stopped with code ${code}${colors.reset}`);
    });
    
  } catch (error) {
    console.error(`${colors.red}❌ Complete test failed: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log();
  console.log(`${colors.yellow}Stopping complete test process...${colors.reset}`);
  process.exit(0);
});

// Run the complete test
runCompleteTest();
