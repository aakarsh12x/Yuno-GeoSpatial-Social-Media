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

    // Query for user's chats with latest message and participant info
    const query = `
      SELECT
        c.id as chat_id,
        c.updated_at as chat_updated_at,
        other_user.id as other_user_id,
        other_user.name as other_user_name,
        other_user.email as other_user_email,
        latest_message.content as last_message,
        latest_message.created_at as last_message_time,
        latest_message.sender_id = $1 as is_from_me
      FROM chats c
      JOIN chat_participants cp ON c.id = cp.chat_id
      JOIN users other_user ON other_user.id != $1
      JOIN chat_participants other_cp ON c.id = other_cp.chat_id AND other_cp.user_id = other_user.id
      LEFT JOIN LATERAL (
        SELECT m.content, m.created_at, m.sender_id
        FROM messages m
        WHERE m.chat_id = c.id
        ORDER BY m.created_at DESC
        LIMIT 1
      ) latest_message ON true
      WHERE cp.user_id = $1
        AND c.chat_type = 'direct'
      ORDER BY COALESCE(latest_message.created_at, c.created_at) DESC
    `;

    const result = await db.query(query, [currentUser.id]);

    const chats = result.rows.map(row => ({
      chat_id: row.chat_id,
      other_user: {
        id: row.other_user_id,
        name: row.other_user_name,
        email: row.other_user_email
      },
      last_message: row.last_message || 'No messages yet',
      last_message_time: row.last_message_time || row.chat_updated_at,
      is_from_me: row.is_from_me
    }));

    return NextResponse.json({
      success: true,
      data: chats,
      meta: {
        total: chats.length
      }
    });

  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching chats' },
      { status: 500 }
    );
  }
}
