const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const { query, testConnection } = require('../database/connection');

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Test connection first
    await testConnection();
    
         // Sample users data with Indian names
     const sampleUsers = [
       {
         name: 'Priya Sharma',
         email: 'priya@example.com',
         password: 'password123',
         age: 24,
         city: 'Mumbai',
         school: 'St. Xavier\'s College',
         college: 'Mumbai University',
         workplace: 'Tech Solutions',
         interests: ['music', 'travel', 'tech', 'reading'],
         latitude: 19.0760,
         longitude: 72.8777
       },
       {
         name: 'Arjun Singh',
         email: 'arjun@example.com',
         password: 'password123',
         age: 26,
         city: 'Delhi',
         school: 'Delhi Public School',
         college: 'Delhi University',
         workplace: 'StartupXYZ',
         interests: ['sports', 'tech', 'cooking', 'gaming'],
         latitude: 28.7041,
         longitude: 77.1025
       },
       {
         name: 'Ananya Patel',
         email: 'ananya@example.com',
         password: 'password123',
         age: 22,
         city: 'Bangalore',
         school: 'Christ University',
         college: 'Christ University',
         workplace: 'Innovation Labs',
         interests: ['gaming', 'tech', 'travel', 'movies'],
         latitude: 12.9716,
         longitude: 77.5946
       },
       {
         name: 'Zara Khan',
         email: 'zara@example.com',
         password: 'password123',
         age: 28,
         city: 'Hyderabad',
         school: 'Osmania University',
         college: 'Osmania University',
         workplace: 'Creative Studio',
         interests: ['art', 'photography', 'travel', 'music'],
         latitude: 17.3850,
         longitude: 78.4867
       },
       {
         name: 'Kavya Reddy',
         email: 'kavya@example.com',
         password: 'password123',
         age: 25,
         city: 'Chennai',
         school: 'Loyola College',
         college: 'Loyola College',
         workplace: 'Finance Hub',
         interests: ['finance', 'reading', 'yoga', 'cooking'],
         latitude: 13.0827,
         longitude: 80.2707
       },
       {
         name: 'Ishaan Mehta',
         email: 'ishaan@example.com',
         password: 'password123',
         age: 23,
         city: 'Pune',
         school: 'Fergusson College',
         college: 'Pune University',
         workplace: 'Digital Solutions',
         interests: ['coding', 'music', 'fitness', 'books'],
         latitude: 18.5204,
         longitude: 73.8567
       },
       {
         name: 'Aisha Verma',
         email: 'aisha@example.com',
         password: 'password123',
         age: 27,
         city: 'Kolkata',
         school: 'Presidency College',
         college: 'Presidency University',
         workplace: 'Marketing Pro',
         interests: ['marketing', 'dance', 'travel', 'food'],
         latitude: 22.5726,
         longitude: 88.3639
       },
               {
          name: 'Riya Kapoor',
          email: 'riya@example.com',
          password: 'password123',
          age: 21,
          city: 'Ahmedabad',
          school: 'Gujarat University',
          college: 'Gujarat University',
          workplace: 'Design Studio',
          interests: ['design', 'art', 'fashion', 'photography'],
          latitude: 23.0225,
          longitude: 72.5714
        },
        {
          name: 'Test User',
          email: 'user123@example.com',
          password: 'user',
          age: 25,
          city: 'Mumbai',
          school: 'Mumbai University',
          college: 'Mumbai University',
          workplace: 'Tech Company',
          interests: ['tech', 'music', 'travel', 'reading'],
          latitude: 19.0760,
          longitude: 72.8777
        }
     ];

    console.log('👥 Creating sample users...');
    
    // Insert users
    for (const user of sampleUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      const userQuery = `
        INSERT INTO users (name, email, password_hash, age, city, school, college, workplace, interests, latitude, longitude)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (email) DO NOTHING
        RETURNING id
      `;
      
      const result = await query(userQuery, [
        user.name,
        user.email,
        hashedPassword,
        user.age,
        user.city,
        user.school,
        user.college,
        user.workplace,
        user.interests,
        user.latitude,
        user.longitude
      ]);
      
      if (result.rows.length > 0) {
        console.log(`✅ Created user: ${user.name} (ID: ${result.rows[0].id})`);
      } else {
        console.log(`ℹ️  User already exists: ${user.name}`);
      }
    }

    // Get user IDs for creating relationships
    const usersResult = await query('SELECT id, email FROM users ORDER BY id');
    const users = usersResult.rows;
    
    if (users.length < 2) {
      console.log('⚠️  Need at least 2 users to create relationships');
      return;
    }

    console.log('⚡ Creating sample sparks...');
    
    // Create some sample sparks (friend requests)
    const sampleSparks = [
      {
        sender_id: users[0].id, // Alice
        receiver_id: users[1].id, // Bob
        message: 'Hey! I noticed we both love tech. Want to connect?'
      },
      {
        sender_id: users[2].id, // Charlie
        receiver_id: users[0].id, // Alice
        message: 'Hi Alice! We both went to NYU. Would love to chat!'
      },
      {
        sender_id: users[3].id, // Diana
        receiver_id: users[4].id, // Eve
        message: 'Hello! I see we have similar interests in reading and cooking.'
      }
    ];

    for (const spark of sampleSparks) {
      const sparkQuery = `
        INSERT INTO sparks (sender_id, receiver_id, message, status)
        VALUES ($1, $2, $3, 'pending')
        ON CONFLICT (sender_id, receiver_id) DO NOTHING
      `;
      
      await query(sparkQuery, [spark.sender_id, spark.receiver_id, spark.message]);
      console.log(`✅ Created spark from user ${spark.sender_id} to ${spark.receiver_id}`);
    }

    // Accept one spark to create a chat
    console.log('💬 Creating sample chat...');
    
    const acceptSparkQuery = `
      UPDATE sparks 
      SET status = 'accepted' 
      WHERE sender_id = $1 AND receiver_id = $2
    `;
    await query(acceptSparkQuery, [users[0].id, users[1].id]);
    
    // Create a chat
    const chatQuery = `
      INSERT INTO chats (chat_type) 
      VALUES ('direct') 
      RETURNING id
    `;
    const chatResult = await query(chatQuery);
    const chatId = chatResult.rows[0].id;
    
    // Add participants
    const participantQuery = `
      INSERT INTO chat_participants (chat_id, user_id) 
      VALUES ($1, $2), ($1, $3)
    `;
    await query(participantQuery, [chatId, users[0].id, users[1].id]);
    
    // Add some sample messages
    const sampleMessages = [
      {
        chat_id: chatId,
        sender_id: users[0].id,
        content: 'Hey Bob! Thanks for accepting my spark!',
        message_type: 'text'
      },
      {
        chat_id: chatId,
        sender_id: users[1].id,
        content: 'Hi Alice! Nice to meet you. I see we both work in tech!',
        message_type: 'text'
      },
      {
        chat_id: chatId,
        sender_id: users[0].id,
        content: 'Yes! What kind of projects are you working on?',
        message_type: 'text'
      }
    ];

    for (const message of sampleMessages) {
      const messageQuery = `
        INSERT INTO messages (chat_id, sender_id, content, message_type)
        VALUES ($1, $2, $3, $4)
      `;
      await query(messageQuery, [message.chat_id, message.sender_id, message.content, message.message_type]);
    }
    
    console.log(`✅ Created chat with ${sampleMessages.length} messages`);

    console.log('\n✨ Database seeding completed successfully!');
    console.log(`📊 Created ${users.length} users`);
    console.log(`⚡ Created ${sampleSparks.length} sparks`);
    console.log(`💬 Created 1 chat with ${sampleMessages.length} messages`);
    
                   console.log('\n🔑 Test Credentials:');
      console.log('Email: user123@example.com, Password: user');
      console.log('Email: priya@example.com, Password: password123');
      console.log('Email: arjun@example.com, Password: password123');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedData();
}

module.exports = { seedData };
