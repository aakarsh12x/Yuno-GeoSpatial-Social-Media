import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // In a real app, you would get the user from the JWT token
    // For now, we'll return a mock user profile
    
    return NextResponse.json({
      success: true,
      data: {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        latitude: 19.0760,
        longitude: 72.8777,
        interests: ['Technology', 'Design', 'Music'],
        bio: 'Passionate about creating amazing experiences',
        avatar: null
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to get profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    console.log('Update profile attempt:', body);
    
    // In a real app, you would update the user profile in the database
    // For now, we'll return the updated profile
    
    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: 1,
        name: body.name || 'Test User',
        email: body.email || 'test@example.com',
        latitude: body.latitude || 19.0760,
        longitude: body.longitude || 72.8777,
        interests: body.interests || ['Technology', 'Design', 'Music'],
        bio: body.bio || 'Passionate about creating amazing experiences',
        avatar: body.avatar || null
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update profile' },
      { status: 500 }
    );
  }
}



