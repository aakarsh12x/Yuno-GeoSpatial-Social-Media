const { query } = require('../database/connection.js');

async function addNearbyTestUser() {
  try {
    console.log('🔍 Adding a test person near Bhopal location...');
    
    // Bhopal coordinates: 23.2257, 77.3867
    // Adding a person about 1.5km away (0.01 degrees ≈ 1.1km)
    const bhopalLat = 23.2257;
    const bhopalLng = 77.3867;
    
    // Add a small offset to create a nearby person (about 1.5km away)
    const nearbyLat = bhopalLat + 0.013; // About 1.5km north
    const nearbyLng = bhopalLng + 0.013; // About 1.5km east
    
    console.log(`📍 Bhopal location: ${bhopalLat}, ${bhopalLng}`);
    console.log(`📍 Nearby person location: ${nearbyLat}, ${nearbyLng}`);
    
    // Create a test person very close to Bhopal
    await query(`
      INSERT INTO users (name, email, password_hash, age, city, school, college, workplace, interests, latitude, longitude, location) 
      VALUES ('Rahul Verma', 'rahul@nearby.com', 'hash123', 25, 'Bhopal', 'Bhopal Public School', 'Barkatullah University', 'Local Tech Company', ARRAY['coding', 'music', 'sports', 'gaming'], ${nearbyLat}, ${nearbyLng}, ST_SetSRID(ST_MakePoint(${nearbyLng}, ${nearbyLat}), 4326))
      ON CONFLICT (email) DO NOTHING
    `);
    
    console.log('✅ Nearby test person created successfully!');
    
    // Test the PostGIS query to find nearby users
    console.log('\n🔍 Testing PostGIS query to find nearby users...');
    
    const testQuery = `
      SELECT
        u.id, u.name, u.email, u.age, u.city, u.school, u.college, u.workplace, u.interests,
        u.latitude, u.longitude,
        ST_Distance(u.location, ST_SetSRID(ST_MakePoint($2, $1), 4326)) / 1000 as distance_km
      FROM users u
      WHERE u.id != $3
        AND u.location IS NOT NULL
        AND ST_DWithin(u.location, ST_SetSRID(ST_MakePoint($2, $1), 4326), $4 * 1000)
      ORDER BY distance_km ASC
      LIMIT 10
    `;
    
    const result = await query(testQuery, [
      bhopalLat, // search latitude
      bhopalLng, // search longitude
      1, // exclude user ID 1 (current user)
      5 // 5km radius
    ]);
    
    console.log(`📊 Found ${result.rows.length} nearby users within 5km:`);
    result.rows.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} - ${user.distance_km.toFixed(2)}km away`);
      console.log(`   Location: ${user.latitude}, ${user.longitude}`);
      console.log(`   Interests: ${user.interests.join(', ')}`);
      console.log('');
    });
    
    // Test with a smaller radius (2km) to see if our nearby person is found
    console.log('🔍 Testing with 2km radius...');
    const nearbyResult = await query(testQuery, [
      bhopalLat,
      bhopalLng,
      1,
      2 // 2km radius
    ]);
    
    console.log(`📊 Found ${nearbyResult.rows.length} nearby users within 2km:`);
    nearbyResult.rows.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} - ${user.distance_km.toFixed(2)}km away`);
    });
    
    // Verify the users were created
    const countResult = await query('SELECT COUNT(*) as count FROM users');
    console.log(`\n📊 Total users in database: ${countResult.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error adding nearby test user:', error.message);
    console.error('Full error:', error);
  }
}

addNearbyTestUser();
