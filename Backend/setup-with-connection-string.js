const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// You can provide the connection string directly as a command line argument
// Example: node setup-with-connection-string.js "postgresql://username:password@host/database"
const connectionStringArg = process.argv[2];

console.log('🚀 Yuno Database Setup with Connection String');
console.log('===========================================');

if (!connectionStringArg) {
  console.error('❌ No connection string provided!');
  console.log('Usage: node setup-with-connection-string.js "postgresql://username:password@host/database"');
  process.exit(1);
}

const createEnvFile = (connectionString) => {
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
};

const testConnection = (connectionString) => {
  return new Promise((resolve, reject) => {
    const { Pool } = require('pg');
    
    // Determine if we need SSL based on the connection string
    const needsSSL = connectionString.includes('.aws.') || 
                     connectionString.includes('.render.') ||
                     connectionString.includes('.neon.') ||
                     connectionString.includes('.supabase.');
    
    const poolConfig = {
      connectionString: connectionString
    };
    
    if (needsSSL) {
      poolConfig.ssl = {
        rejectUnauthorized: false,
        sslmode: 'require'
      };
    }
    
    const pool = new Pool(poolConfig);
    
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
    // Create .env file with the provided connection string
    createEnvFile(connectionStringArg);
    
    // Test connection
    try {
      await testConnection(connectionStringArg);
    } catch (error) {
      console.error('❌ Database connection test failed.');
      console.log('⚠️  Please make sure your database is set up and the connection string is correct.');
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
