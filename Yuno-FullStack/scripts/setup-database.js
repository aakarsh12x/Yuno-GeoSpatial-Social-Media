const fs = require('fs');
const path = require('path');
const db = require('../src/lib/database');

async function setupDatabase() {
  try {
    console.log('🔧 Setting up database...');

    // Test database connection
    await db.testConnection();

    // Read and execute schema
    const schemaPath = path.join(__dirname, '../../Backend/database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('📄 Executing database schema...');

    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await db.query(statement);
        } catch (error) {
          // Ignore errors for CREATE EXTENSION IF NOT EXISTS and CREATE TABLE IF NOT EXISTS
          if (!error.message.includes('already exists')) {
            console.warn('⚠️  Statement failed:', statement.substring(0, 100) + '...');
            console.warn('Error:', error.message);
          }
        }
      }
    }

    console.log('✅ Database schema executed successfully');

    // Create some test users
    console.log('👤 Creating test users...');

    const testUsers = [
      {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        password: 'password123',
        age: 25,
        city: 'Mumbai',
        school: 'Mumbai University',
        interests: ['Technology', 'Design', 'Music'],
        latitude: 19.0760,
        longitude: 72.8777
      },
      {
        name: 'Bob Smith',
        email: 'bob@example.com',
        password: 'password123',
        age: 28,
        city: 'Delhi',
        college: 'IIT Delhi',
        interests: ['Technology', 'Sports', 'Reading'],
        latitude: 28.6139,
        longitude: 77.2090
      },
      {
        name: 'Charlie Brown',
        email: 'charlie@example.com',
        password: 'password123',
        age: 22,
        city: 'Bangalore',
        college: 'IISc Bangalore',
        interests: ['Science', 'Music', 'Travel'],
        latitude: 12.9716,
        longitude: 77.5946
      },
      {
        name: 'Diana Prince',
        email: 'diana@example.com',
        password: 'password123',
        age: 26,
        city: 'Chennai',
        workplace: 'Tech Corp',
        interests: ['Art', 'Photography', 'Cooking'],
        latitude: 13.0827,
        longitude: 80.2707
      },
      {
        name: 'Eve Wilson',
        email: 'eve@example.com',
        password: 'password123',
        age: 24,
        city: 'Kolkata',
        college: 'Jadavpur University',
        interests: ['Books', 'Dance', 'Fitness'],
        latitude: 22.5726,
        longitude: 88.3639
      }
    ];

    const auth = require('../src/lib/auth');

    for (const userData of testUsers) {
      try {
        const hashedPassword = await auth.hashPassword(userData.password);

        const insertQuery = `
          INSERT INTO users (name, email, password_hash, age, city, school, college, workplace, interests, latitude, longitude)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          ON CONFLICT (email) DO NOTHING
        `;

        await db.query(insertQuery, [
          userData.name,
          userData.email,
          hashedPassword,
          userData.age,
          userData.city,
          userData.school || null,
          userData.college || null,
          userData.workplace || null,
          userData.interests,
          userData.latitude,
          userData.longitude
        ]);

        console.log(`✅ Created test user: ${userData.name}`);
      } catch (error) {
        console.warn(`⚠️  Failed to create user ${userData.name}:`, error.message);
      }
    }

    console.log('🎉 Database setup completed successfully!');
    console.log('');
    console.log('Test users created:');
    testUsers.forEach(user => {
      console.log(`  - ${user.name}: ${user.email} / password123`);
    });
    console.log('');
    console.log('You can now test the API endpoints with these credentials.');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };



