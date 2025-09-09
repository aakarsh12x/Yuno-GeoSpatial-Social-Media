import { NextResponse } from 'next/server';

// Mock database and auth for serverless deployment
const mockDb = {
  query: async (query, params) => {
    // Return mock data
    return {
      rows: [
        {
          id: 1,
          name: 'Priya Sharma',
          email: 'priya@example.com',
          age: 24,
          city: 'Mumbai',
          school: 'St. Xavier\'s College',
          college: 'Mumbai University',
          workplace: 'Tech Solutions',
          interests: ['music', 'travel', 'tech', 'reading'],
          latitude: 19.076,
          longitude: 72.8777,
          distance_km: 2.5
        },
        {
          id: 2,
          name: 'Ananya Patel',
          email: 'ananya@example.com',
          age: 22,
          city: 'Bangalore',
          school: 'Christ University',
          college: 'Christ University',
          workplace: 'Innovation Labs',
          interests: ['gaming', 'tech', 'travel', 'movies'],
          latitude: 12.9716,
          longitude: 77.5946,
          distance_km: 5.2
        },
        {
          id: 3,
          name: 'Arjun Singh',
          email: 'arjun@example.com',
          age: 26,
          city: 'Delhi',
          school: 'Delhi Public School',
          college: 'Delhi University',
          workplace: 'StartupXYZ',
          interests: ['sports', 'tech', 'cooking', 'gaming'],
          latitude: 28.7041,
          longitude: 77.1025,
          distance_km: 8.7
        },
        {
          id: 4,
          name: 'Zara Khan',
          email: 'zara@example.com',
          age: 23,
          city: 'Hyderabad',
          school: 'Osmania University',
          college: 'Osmania University',
          workplace: 'Creative Studio',
          interests: ['art', 'photography', 'travel', 'music'],
          latitude: 17.385,
          longitude: 78.4867,
          distance_km: 12.3
        },
        {
          id: 5,
          name: 'Kavya Reddy',
          email: 'kavya@example.com',
          age: 25,
          city: 'Chennai',
          school: 'Chennai University',
          college: 'Chennai University',
          workplace: 'Digital Solutions',
          interests: ['tech', 'reading', 'cooking', 'yoga'],
          latitude: 13.0827,
          longitude: 80.2707,
          distance_km: 15.8
        }
      ]
    };
  }
};

const mockAuth = {
  getUserFromToken: async (token) => {
    // Return mock user data
    return {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      latitude: 19.076,
      longitude: 72.8777,
      interests: ['tech', 'music', 'travel']
    };
  }
};

export async function GET(request) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Get current user from token
    const currentUser = await mockAuth.getUserFromToken(token);

    const { searchParams } = new URL(request.url);
    const radius = parseFloat(searchParams.get('radius')) || 20; // Default 20km
    const userLat = parseFloat(searchParams.get('latitude')) || currentUser.latitude;
    const userLng = parseFloat(searchParams.get('longitude')) || currentUser.longitude;

    if (!userLat || !userLng) {
      return NextResponse.json(
        { success: false, message: 'User location not available' },
        { status: 400 }
      );
    }

    // Query for nearby users using PostGIS
    const query = `
      SELECT
        id, name, email, age, city, school, college, workplace, interests,
        latitude, longitude,
        ST_Distance(location, ST_SetSRID(ST_MakePoint($3, $2), 4326)) / 1000 as distance_km
      FROM users
      WHERE id != $1
        AND location IS NOT NULL
        AND ST_DWithin(location, ST_SetSRID(ST_MakePoint($3, $2), 4326), $4 * 1000)
      ORDER BY distance_km
      LIMIT 50
    `;

    const result = await mockDb.query(query, [currentUser.id, userLat, userLng, radius]);

    // Calculate common interests for each user
    const usersWithCommonInterests = result.rows.map(user => {
      const currentUserInterests = currentUser.interests || [];
      const userInterests = user.interests || [];
      const commonInterests = currentUserInterests.filter(interest =>
        userInterests.includes(interest)
      );

      return {
        ...user,
        distance: Math.round(user.distance_km * 100) / 100, // Round to 2 decimal places
        common_interests: commonInterests,
        common_interests_count: commonInterests.length
      };
    });

    return NextResponse.json({
      success: true,
      data: usersWithCommonInterests,
      meta: {
        total: usersWithCommonInterests.length,
        radius: radius,
        center: { latitude: userLat, longitude: userLng }
      }
    });

  } catch (error) {
    console.error('Discover error:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching nearby users' },
      { status: 500 }
    );
  }
}
