const { query, testConnection } = require('../database/connection');

const createMissingTables = async () => {
  try {
    console.log('🔧 Creating missing tables...');
    
    // Test connection first
    await testConnection();
    
    // Create sparks table
    console.log('Creating sparks table...');
    await query(`
      CREATE TABLE IF NOT EXISTS sparks (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
        message TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(sender_id, receiver_id)
      )
    `);
    
    // Create chats table
    console.log('Creating chats table...');
    await query(`
      CREATE TABLE IF NOT EXISTS chats (
        id SERIAL PRIMARY KEY,
        chat_type VARCHAR(20) DEFAULT 'direct' CHECK (chat_type IN ('direct', 'group')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create chat_participants table
    console.log('Creating chat_participants table...');
    await query(`
      CREATE TABLE IF NOT EXISTS chat_participants (
        id SERIAL PRIMARY KEY,
        chat_id INTEGER REFERENCES chats(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_read_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(chat_id, user_id)
      )
    `);
    
    // Create messages table
    console.log('Creating messages table...');
    await query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        chat_id INTEGER REFERENCES chats(id) ON DELETE CASCADE,
        sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create indexes
    console.log('Creating indexes...');
    await query('CREATE INDEX IF NOT EXISTS idx_sparks_sender_id ON sparks(sender_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_sparks_receiver_id ON sparks(receiver_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_sparks_status ON sparks(status)');
    await query('CREATE INDEX IF NOT EXISTS idx_sparks_created_at ON sparks(created_at)');
    
    await query('CREATE INDEX IF NOT EXISTS idx_chats_updated_at ON chats(updated_at)');
    
    await query('CREATE INDEX IF NOT EXISTS idx_chat_participants_chat_id ON chat_participants(chat_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_chat_participants_user_id ON chat_participants(user_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_chat_participants_last_read ON chat_participants(last_read_at)');
    
    await query('CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at)');
    
    // Create triggers
    console.log('Creating triggers...');
    await query(`
      CREATE TRIGGER update_sparks_updated_at BEFORE UPDATE ON sparks
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `);
    
    await query(`
      CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON chats
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `);
    
    await query(`
      CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `);
    
    console.log('✅ All missing tables created successfully!');
    
    // Verify tables exist
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'sparks', 'chats', 'messages', 'chat_participants')
      ORDER BY table_name
    `;
    const tablesResult = await query(tablesQuery);
    console.log(`📊 Found ${tablesResult.rows.length} tables: ${tablesResult.rows.map(t => t.table_name).join(', ')}`);
    
  } catch (error) {
    console.error('❌ Failed to create missing tables:', error.message);
    process.exit(1);
  }
};

// Run if this file is executed directly
if (require.main === module) {
  createMissingTables();
}

module.exports = { createMissingTables };
