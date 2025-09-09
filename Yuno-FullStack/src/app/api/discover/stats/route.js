import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    console.log('Discover stats request');
    
    return NextResponse.json({
      success: true,
      data: {
        totalUsers: 1250,
        activeUsers: 847,
        totalSparks: 3420,
        activeSparks: 1234,
        popularInterests: [
          { name: 'Technology', count: 456 },
          { name: 'Design', count: 389 },
          { name: 'Music', count: 234 },
          { name: 'Travel', count: 198 },
          { name: 'Cooking', count: 167 }
        ]
      }
    });
  } catch (error) {
    console.error('Discover stats error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to get stats' },
      { status: 500 }
    );
  }
}



