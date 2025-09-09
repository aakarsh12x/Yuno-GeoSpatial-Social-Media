import { NextResponse } from 'next/server';
import db from '../../../../lib/database.js';
import auth from '../../../../lib/auth.js';

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
    const currentUser = await auth.getUserFromToken(token);

    const { searchParams } = new URL(request.url);
    const radius = parseFloat(searchParams.get('radius')) || 50; // Default 50km for sparks
    const userLat = parseFloat(searchParams.get('latitude')) || currentUser.latitude;
    const userLng = parseFloat(searchParams.get('longitude')) || currentUser.longitude;

    if (!userLat || !userLng) {
      return NextResponse.json(
        { success: false, message: 'User location not available' },
        { status: 400 }
      );
    }

    // Query for nearby users that haven't been sparked with yet
    const query = `
      SELECT
        u.id, u.name, u.email, u.age, u.city, u.school, u.college, u.workplace, u.interests,
        u.latitude, u.longitude,
        ST_Distance(u.location, ST_SetSRID(ST_MakePoint($3, $2), 4326)) / 1000 as distance_km
      FROM users u
      WHERE u.id != $1
        AND u.location IS NOT NULL
        AND ST_DWithin(u.location, ST_SetSRID(ST_MakePoint($3, $2), 4326), $4 * 1000)
        AND NOT EXISTS (
          SELECT 1 FROM sparks s
          WHERE (s.sender_id = $1 AND s.receiver_id = u.id)
             OR (s.sender_id = u.id AND s.receiver_id = $1)
        )
      ORDER BY
        -- Prioritize users with common interests
        array_length(
          ARRAY(
            SELECT unnest(u.interests)
            INTERSECT
            SELECT unnest($5::text[])
          ), 1
        ) DESC,
        distance_km ASC
      LIMIT 20
    `;

    const result = await db.query(query, [
      currentUser.id,
      userLat,
      userLng,
      radius,
      currentUser.interests || []
    ]);

    // Calculate common interests for each user
    const usersWithCommonInterests = result.rows.map(user => {
      const currentUserInterests = currentUser.interests || [];
      const userInterests = user.interests || [];
      const commonInterests = currentUserInterests.filter(interest =>
        userInterests.includes(interest)
      );

      return {
        ...user,
        distance: Math.round(user.distance_km * 100) / 100,
        common_interests: commonInterests,
        common_interests_count: commonInterests.length,
        compatibility_score: Math.min(100, commonInterests.length * 25 + Math.max(0, 20 - Math.floor(user.distance_km))) // Simple scoring
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
    console.error('Sparks nearby error:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching nearby sparks' },
      { status: 500 }
    );
  }
}
