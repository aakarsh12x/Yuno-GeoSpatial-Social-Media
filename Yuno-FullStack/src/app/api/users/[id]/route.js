import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    console.log('Get user by ID:', id);
    
    // In a real app, you would fetch the user from the database
    // For now, we'll return a mock user
    
    return NextResponse.json({
      success: true,
      data: {
        id: parseInt(id),
        name: `User ${id}`,
        email: `user${id}@example.com`,
        latitude: 19.0760,
        longitude: 72.8777,
        interests: ['Technology', 'Design', 'Music'],
        bio: 'Passionate about creating amazing experiences',
        avatar: null
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to get user' },
      { status: 500 }
    );
  }
}



