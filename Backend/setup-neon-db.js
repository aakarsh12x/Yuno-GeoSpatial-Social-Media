const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Neon PostgreSQL connection details
// Replace these with your actual Neon database credentials
const neonConfig = {
  host: 'ep-cool-forest-123456.us-east-2.aws.neon.tech',
  database: 'neondb',
  user: 'yuno_user',
  password: 'your_password_here',
  sslMode: 'require'
};

console.log('🚀 Yuno Database Setup with Neon PostgreSQL');
console.log('==========================================');
console.log('This script will set up your .env file with Neon PostgreSQL connection.');
console.log('⚠️  IMPORTANT: You must replace the placeholder values in this script with your actual Neon credentials!');
console.log('\n');

const createEnvFile = () => {
  // Format: postgresql://user:password@host/database
  const connectionString = `postgresql://${neonConfig.user}:${neonConfig.password}@${neonConfig.host}/${neonConfig.database}`;
  
  const envContent = `# Neon PostgreSQL Configuration
DATABASE_URL=${connectionString}

# JWT Configuration
JWT_SECRET=yuno-super-secret-jwt-key-for-development-2025
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:3000
`;

  const envPath = path.join(__dirname, '.env');
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully!');
  return connectionString;
};

const testConnection = (connectionString) => {
  return new Promise((resolve, reject) => {
    const { Pool } = require('pg');
    
    const pool = new Pool({
      connectionString: connectionString,
      ssl: {
        rejectUnauthorized: false,
        sslmode: 'require'
      }
    });
    
    pool.connect()
      .then(client => {
        console.log('✅ Database connection successful!');
        client.release();
        pool.end();
        resolve(true);
      })
      .catch(err => {
        console.error('❌ Database connection failed:', err.message);
        reject(err);
      });
  });
};

const runMigrations = () => {
  return new Promise((resolve, reject) => {
    console.log('🔧 Running database migrations...');
    
    exec('node scripts/migrate.js', (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Migration failed: ${stderr}`);
        reject(error);
      } else {
        console.log(stdout);
        console.log('✅ Database migrations completed successfully!');
        resolve(true);
      }
    });
  });
};

const main = async () => {
  try {
    console.log('⚠️  WARNING: This script contains placeholder database credentials.');
    console.log('⚠️  Please make sure you have replaced them with your actual Neon credentials.');
    console.log('⚠️  If you have not done this, press Ctrl+C now and edit the script first.\n');
    
    // Create .env file and get connection string
    const connectionString = createEnvFile();
    
    // Test connection
    try {
      await testConnection(connectionString);
    } catch (error) {
      console.error('❌ Database connection test failed.');
      console.log('⚠️  Please make sure your Neon database is set up and credentials are correct.');
      console.log('⚠️  You need to edit this script with your actual Neon credentials.');
      process.exit(1);
    }
    
    // Run migrations
    try {
      await runMigrations();
    } catch (error) {
      console.error('❌ Failed to run migrations.');
      process.exit(1);
    }
    
    console.log('\n✨ Database setup complete!');
    console.log('🚀 You can now start the server with: npm run dev');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
};

main();
