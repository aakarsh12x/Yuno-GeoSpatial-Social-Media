const { query } = require('../database/connection.js');

async function createTestUsers() {
  try {
    console.log('🔍 Creating test users...');
    
    // Create test users with Indian names and locations
    await query(`
      INSERT INTO users (name, email, password_hash, age, city, school, college, workplace, interests, latitude, longitude, location) 
      VALUES 
        ('Priya Sharma', 'priya@test.com', 'hash123', 24, 'Mumbai', 'St. Xavier College', 'Mumbai University', 'Tech Solutions', ARRAY['music', 'travel', 'tech', 'reading'], 19.0760, 72.8777, ST_SetSRID(ST_MakePoint(72.8777, 19.0760), 4326)),
        ('Arjun Singh', 'arjun@test.com', 'hash456', 26, 'Delhi', 'Delhi Public School', 'Delhi University', 'StartupXYZ', ARRAY['sports', 'tech', 'cooking', 'gaming'], 28.7041, 77.1025, ST_SetSRID(ST_MakePoint(77.1025, 28.7041), 4326)),
        ('Ananya Patel', 'ananya@test.com', 'hash789', 22, 'Bangalore', 'Christ University', 'Christ University', 'Innovation Labs', ARRAY['gaming', 'tech', 'travel', 'movies'], 12.9716, 77.5946, ST_SetSRID(ST_MakePoint(77.5946, 12.9716), 4326))
    `);
    
    console.log('✅ Test users created successfully!');
    
    // Verify the users were created
    const result = await query('SELECT COUNT(*) as count FROM users');
    console.log(`📊 Total users in database: ${result.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error creating test users:', error.message);
  }
}

createTestUsers();
