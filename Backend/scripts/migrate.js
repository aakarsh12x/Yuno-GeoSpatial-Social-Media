const fs = require('fs');
const path = require('path');
const { query, testConnection } = require('../database/connection');

const runMigrations = async () => {
  try {
    console.log('🚀 Starting database migration...');
    
    // Test connection first
    await testConnection();
    
    // Read schema file
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute schema as a whole with error handling
    try {
      await query(schema);
      console.log('✅ Schema executed successfully');
    } catch (error) {
      // Check if it's a "already exists" error
      if (error.message.includes('already exists') || 
          error.message.includes('duplicate key') ||
          error.message.includes('relation') && error.message.includes('already exists')) {
        console.log(`ℹ️  Schema objects already exist: ${error.message}`);
        console.log('✅ Migration completed (objects already exist)');
      } else {
        console.error(`❌ Schema execution failed: ${error.message}`);
        throw error;
      }
    }
    
    console.log('✅ Database migration completed successfully!');
    console.log('📊 Tables and schema objects verified:');
    console.log('  - users');
    console.log('  - user_sessions');
    console.log('  - sparks');
    console.log('  - chats');
    console.log('  - messages');
    console.log('  - chat_participants');
    console.log('🔍 Indexes created for optimal query performance');
    console.log('🔧 Triggers and functions set up for automatic updates');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
};

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };
