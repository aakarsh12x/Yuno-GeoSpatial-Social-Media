import { NextResponse } from 'next/server';

// Mock database and auth for serverless deployment
const mockDb = {
  query: async (query, params) => {
    // Return mock user data
    return {
      rows: [
        {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          password_hash: '$2b$10$mock.hash.for.testing',
          age: 25,
          city: 'Mumbai',
          school: 'Test School',
          college: 'Test University',
          workplace: 'Test Company',
          interests: ['tech', 'music', 'travel'],
          latitude: 19.076,
          longitude: 72.8777,
          created_at: new Date()
        }
      ]
    };
  }
};

const mockAuth = {
  verifyPassword: async (password, hash) => {
    // Mock password verification - accept any password for testing
    return true;
  },
  generateAccessToken: (user) => {
    return `mock-access-token-${user.id}-${Date.now()}`;
  },
  generateRefreshToken: (user) => {
    return `mock-refresh-token-${user.id}-${Date.now()}`;
  },
  saveRefreshToken: async (userId, token, expiresAt, userAgent, ip) => {
    // Mock token saving
    return true;
  }
};

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const userQuery = 'SELECT * FROM users WHERE email = $1';
    const userResult = await mockDb.query(userQuery, [email]);

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = userResult.rows[0];

    // Verify password
    const isValidPassword = await mockAuth.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate tokens
    const accessToken = mockAuth.generateAccessToken(user);
    const refreshToken = mockAuth.generateRefreshToken(user);

    // Save refresh token to database
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await mockAuth.saveRefreshToken(user.id, refreshToken, expiresAt, request.headers.get('user-agent'), request.ip);

    // Return user data (without password hash)
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      age: user.age,
      city: user.city,
      school: user.school,
      college: user.college,
      workplace: user.workplace,
      interests: user.interests,
      latitude: user.latitude,
      longitude: user.longitude,
      created_at: user.created_at
    };

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userData,
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
