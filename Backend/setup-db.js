const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Default configuration
const defaultConfig = {
  host: 'localhost',
  port: '5432',
  database: 'yuno_db',
  user: 'postgres',
  password: 'postgres'
};

console.log('🚀 Yuno Database Setup Wizard');
console.log('============================');
console.log('This script will help you set up a PostgreSQL database for Yuno.');
console.log('You need PostgreSQL installed with PostGIS extension available.');
console.log('\n');

const promptForConfig = () => {
  return new Promise((resolve) => {
    console.log('Please enter your PostgreSQL database details:');
    
    rl.question(`Host (default: ${defaultConfig.host}): `, (host) => {
      rl.question(`Port (default: ${defaultConfig.port}): `, (port) => {
        rl.question(`Database name (default: ${defaultConfig.database}): `, (database) => {
          rl.question(`Username (default: ${defaultConfig.user}): `, (user) => {
            rl.question(`Password (default: ${defaultConfig.password}): `, (password) => {
              const config = {
                host: host || defaultConfig.host,
                port: port || defaultConfig.port,
                database: database || defaultConfig.database,
                user: user || defaultConfig.user,
                password: password || defaultConfig.password
              };
              
              resolve(config);
            });
          });
        });
      });
    });
  });
};

const createEnvFile = (config) => {
  const connectionString = `postgresql://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}`;
  
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

const testConnection = () => {
  return new Promise((resolve, reject) => {
    const { Pool } = require('pg');
    require('dotenv').config();
    
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false,
      } : false
    });
    
    pool.connect()
      .then(client => {
        console.log('✅ Database connection successful!');
        client.release();
        resolve(true);
      })
      .catch(err => {
        console.error('❌ Database connection failed:', err.message);
        reject(err);
      });
  });
};

const createDatabase = (config) => {
  return new Promise((resolve, reject) => {
    // Connection string for postgres default database
    const adminConnString = `postgresql://${config.user}:${config.password}@${config.host}:${config.port}/postgres`;
    
    const createDbCommand = `CREATE DATABASE ${config.database};`;
    
    console.log(`🔧 Creating database ${config.database}...`);
    
    // Use psql to create the database
    exec(`psql "${adminConnString}" -c "${createDbCommand}"`, (error, stdout, stderr) => {
      if (error) {
        if (stderr.includes('already exists')) {
          console.log(`ℹ️  Database ${config.database} already exists.`);
          resolve(true);
        } else {
          console.error(`❌ Error creating database: ${stderr}`);
          reject(error);
        }
      } else {
        console.log(`✅ Database ${config.database} created successfully!`);
        resolve(true);
      }
    });
  });
};

const installPostGIS = (config) => {
  return new Promise((resolve, reject) => {
    const connString = `postgresql://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}`;
    
    console.log('🔧 Installing PostGIS extension...');
    
    exec(`psql "${connString}" -c "CREATE EXTENSION IF NOT EXISTS postgis;"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error installing PostGIS: ${stderr}`);
        reject(error);
      } else {
        console.log('✅ PostGIS extension installed successfully!');
        resolve(true);
      }
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
    // Get database configuration
    const config = await promptForConfig();
    rl.close();
    
    // Create .env file
    createEnvFile(config);
    
    // Create database if it doesn't exist
    try {
      await createDatabase(config);
    } catch (error) {
      console.log('⚠️  Continuing with existing database...');
    }
    
    // Install PostGIS extension
    try {
      await installPostGIS(config);
    } catch (error) {
      console.error('❌ Failed to install PostGIS extension. Please install it manually.');
      process.exit(1);
    }
    
    // Test connection
    try {
      await testConnection();
    } catch (error) {
      console.error('❌ Database connection test failed. Please check your configuration.');
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
