const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Default configuration - adjust these values as needed
const dbConfig = {
  host: 'localhost',
  port: '5432',
  database: 'yuno_db',
  user: 'postgres',
  password: 'postgres'
};

console.log('🚀 Yuno Database Setup (Non-Interactive)');
console.log('======================================');

const createEnvFile = () => {
  const connectionString = `postgresql://${dbConfig.user}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`;
  
  const envContent = `# PostgreSQL Configuration
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
      ssl: false
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
    // Create .env file and get connection string
    const connectionString = createEnvFile();
    
    // Test connection
    try {
      await testConnection(connectionString);
    } catch (error) {
      console.error('❌ Database connection test failed.');
      console.log('⚠️  Please make sure PostgreSQL is running and the credentials are correct.');
      console.log('⚠️  You may need to create the database first:');
      console.log(`   createdb ${dbConfig.database}`);
      console.log('⚠️  Or adjust the configuration in this script.');
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
