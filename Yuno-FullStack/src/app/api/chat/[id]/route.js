import { NextResponse } from 'next/server';
import db from '../../../../lib/database.js';
import auth from '../../../../lib/auth.js';

export async function GET(request, { params }) {
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

    const chatId = parseInt(params.id);

    if (!chatId) {
      return NextResponse.json(
        { success: false, message: 'Invalid chat ID' },
        { status: 400 }
      );
    }

    // Check if user is participant in this chat
    const participantCheck = await db.query(
      'SELECT 1 FROM chat_participants WHERE chat_id = $1 AND user_id = $2',
      [chatId, currentUser.id]
    );

    if (participantCheck.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    // Get messages for this chat
    const messagesQuery = `
      SELECT
        m.id,
        m.content,
        m.message_type,
        m.created_at,
        m.sender_id,
        u.name as sender_name,
        u.email as sender_email,
        m.sender_id = $2 as is_from_me
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.chat_id = $1
      ORDER BY m.created_at ASC
    `;

    const messagesResult = await db.query(messagesQuery, [chatId, currentUser.id]);

    // Get chat info and other participant
    const chatQuery = `
      SELECT
        c.id,
        c.chat_type,
        c.created_at,
        other_user.id as other_user_id,
        other_user.name as other_user_name,
        other_user.email as other_user_email
      FROM chats c
      JOIN chat_participants cp ON c.id = cp.chat_id
      JOIN users other_user ON other_user.id != $2
      JOIN chat_participants other_cp ON c.id = other_cp.chat_id AND other_cp.user_id = other_user.id
      WHERE c.id = $1 AND cp.user_id = $2
    `;

    const chatResult = await db.query(chatQuery, [chatId, currentUser.id]);

    if (chatResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Chat not found' },
        { status: 404 }
      );
    }

    const chat = chatResult.rows[0];

    return NextResponse.json({
      success: true,
      data: {
        chat: {
          id: chat.id,
          type: chat.chat_type,
          created_at: chat.created_at,
          other_user: {
            id: chat.other_user_id,
            name: chat.other_user_name,
            email: chat.other_user_email
          }
        },
        messages: messagesResult.rows,
        meta: {
          total_messages: messagesResult.rows.length
        }
      }
    });

  } catch (error) {
    console.error('Chat messages error:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching chat messages' },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
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

    const chatId = parseInt(params.id);
    const { content, message_type } = await request.json();

    if (!chatId || !content) {
      return NextResponse.json(
        { success: false, message: 'Chat ID and content are required' },
        { status: 400 }
      );
    }

    // Check if user is participant in this chat
    const participantCheck = await db.query(
      'SELECT 1 FROM chat_participants WHERE chat_id = $1 AND user_id = $2',
      [chatId, currentUser.id]
    );

    if (participantCheck.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    // Insert message
    const insertQuery = `
      INSERT INTO messages (chat_id, sender_id, content, message_type)
      VALUES ($1, $2, $3, $4)
      RETURNING id, created_at
    `;

    const result = await db.query(insertQuery, [
      chatId,
      currentUser.id,
      content,
      message_type || 'text'
    ]);

    // Update chat's updated_at timestamp
    await db.query(
      'UPDATE chats SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [chatId]
    );

    // Update last_read_at for sender
    await db.query(
      'UPDATE chat_participants SET last_read_at = CURRENT_TIMESTAMP WHERE chat_id = $1 AND user_id = $2',
      [chatId, currentUser.id]
    );

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      data: {
        message_id: result.rows[0].id,
        created_at: result.rows[0].created_at
      }
    });

  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { success: false, message: 'Error sending message' },
      { status: 500 }
    );
  }
}
