import { NextResponse } from 'next/server';
import db from '../../../../lib/database.js';
import auth from '../../../../lib/auth.js';

export async function PUT(request, { params }) {
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

    const sparkId = parseInt(params.id);
    const { action } = await request.json(); // 'accept' or 'reject'

    if (!sparkId || !action || !['accept', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, message: 'Invalid spark ID or action' },
        { status: 400 }
      );
    }

    // Check if spark exists and user is the receiver
    const sparkQuery = `
      SELECT s.*, u.name as sender_name
      FROM sparks s
      JOIN users u ON s.sender_id = u.id
      WHERE s.id = $1 AND s.receiver_id = $2 AND s.status = 'pending'
    `;

    const sparkResult = await db.query(sparkQuery, [sparkId, currentUser.id]);

    if (sparkResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Spark not found or already processed' },
        { status: 404 }
      );
    }

    const spark = sparkResult.rows[0];
    const newStatus = action === 'accept' ? 'accepted' : 'rejected';

    // Update spark status
    const updateQuery = `
      UPDATE sparks
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, status, updated_at
    `;

    const updateResult = await db.query(updateQuery, [newStatus, sparkId]);

    // If accepted, create a chat between the users
    if (action === 'accept') {
      // Check if chat already exists
      const existingChat = await db.query(`
        SELECT c.id
        FROM chats c
        JOIN chat_participants cp1 ON c.id = cp1.chat_id AND cp1.user_id = $1
        JOIN chat_participants cp2 ON c.id = cp2.chat_id AND cp2.user_id = $2
        WHERE c.chat_type = 'direct'
      `, [currentUser.id, spark.sender_id]);

      if (existingChat.rows.length === 0) {
        // Create new chat
        const chatInsert = await db.query(
          'INSERT INTO chats (chat_type) VALUES ($1) RETURNING id',
          ['direct']
        );

        const chatId = chatInsert.rows[0].id;

        // Add participants
        await db.query(
          'INSERT INTO chat_participants (chat_id, user_id) VALUES ($1, $2), ($1, $3)',
          [chatId, currentUser.id, spark.sender_id]
        );

        // Add system message
        await db.query(
          'INSERT INTO messages (chat_id, sender_id, content, message_type) VALUES ($1, $2, $3, $4)',
          [chatId, currentUser.id, `You and ${spark.sender_name} are now connected!`, 'system']
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `Spark ${action}ed successfully`,
      data: {
        spark_id: updateResult.rows[0].id,
        status: updateResult.rows[0].status,
        updated_at: updateResult.rows[0].updated_at,
        action: action
      }
    });

  } catch (error) {
    console.error('Spark response error:', error);
    return NextResponse.json(
      { success: false, message: 'Error processing spark response' },
      { status: 500 }
    );
  }
}
