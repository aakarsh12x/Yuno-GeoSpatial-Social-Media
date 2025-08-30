const fs = require('fs');
const path = require('path');

/**
 * Setup script to help with initial project configuration
 */

console.log('🚀 Setting up Yuno Backend...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '../.env');
const envExamplePath = path.join(__dirname, '../env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    console.log('📋 Creating .env file from example...');
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created successfully!');
    console.log('⚠️  Please update the .env file with your actual configuration values.\n');
  } else {
    console.log('❌ env.example file not found. Creating basic .env...');
    const basicEnv = `# Database Configuration
DATABASE_URL=postgresql://username:password@ep-example.us-east-1.aws.neon.tech/neondb

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:3000
`;
    fs.writeFileSync(envPath, basicEnv);
    console.log('✅ Basic .env file created!');
    console.log('⚠️  Please update the .env file with your actual configuration values.\n');
  }
} else {
  console.log('✅ .env file already exists.\n');
}

// Check for required environment variables
console.log('🔍 Checking environment configuration...');

require('dotenv').config();

const requiredVars = ['DATABASE_URL', 'JWT_SECRET'];
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.log('❌ Missing required environment variables:');
  missingVars.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  console.log('\n📝 Please update your .env file with the missing values.\n');
} else {
  console.log('✅ All required environment variables are set.\n');
}

// Provide setup instructions
console.log('📋 Next Steps:');
console.log('1. Update your .env file with actual values (especially DATABASE_URL and JWT_SECRET)');
console.log('2. Run database migrations: npm run migrate');
console.log('3. Start the development server: npm run dev');
console.log('4. Visit http://localhost:5000/health to verify the server is running');
console.log('5. Check http://localhost:5000/api for API documentation\n');

console.log('🔗 Useful Resources:');
console.log('- NeonDB: https://neon.tech/');
console.log('- JWT Secret Generator: https://generate-secret.vercel.app/32');
console.log('- API Documentation: See README.md for detailed endpoint information\n');

console.log('✨ Setup complete! Happy coding!');
