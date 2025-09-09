import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || 10;
    
    console.log('Popular interests request, limit:', limit);
    
    const interests = [
      { name: 'Technology', count: 456, icon: '💻' },
      { name: 'Design', count: 389, icon: '🎨' },
      { name: 'Music', count: 234, icon: '🎵' },
      { name: 'Travel', count: 198, icon: '✈️' },
      { name: 'Cooking', count: 167, icon: '👨‍🍳' },
      { name: 'Photography', count: 145, icon: '📸' },
      { name: 'Fitness', count: 134, icon: '💪' },
      { name: 'Reading', count: 123, icon: '📚' },
      { name: 'Gaming', count: 112, icon: '🎮' },
      { name: 'Art', count: 98, icon: '🖼️' }
    ].slice(0, parseInt(limit));
    
    return NextResponse.json({
      success: true,
      data: interests
    });
  } catch (error) {
    console.error('Popular interests error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to get popular interests' },
      { status: 500 }
    );
  }
}



