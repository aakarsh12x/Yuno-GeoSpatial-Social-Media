import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Register attempt:', body);
    
    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: 2,
          name: body.name || 'New User',
          email: body.email || 'new@example.com',
          latitude: 19.0760,
          longitude: 72.8777
        },
        tokens: {
          accessToken: 'vercel-token-' + Date.now(),
          refreshToken: 'vercel-refresh-token-' + Date.now()
        }
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { success: false, message: 'Invalid request' },
      { status: 400 }
    );
  }
}
