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

    // Query for pending sparks (received by current user)
    const query = `
      SELECT
        s.id as spark_id,
        s.message,
        s.created_at,
        u.id,
        u.name,
        u.email,
        u.age,
        u.city,
        u.interests,
        u.latitude,
        u.longitude
      FROM sparks s
      JOIN users u ON s.sender_id = u.id
      WHERE s.receiver_id = $1
        AND s.status = 'pending'
      ORDER BY s.created_at DESC
    `;

    const result = await db.query(query, [currentUser.id]);

    const pendingSparks = result.rows.map(row => ({
      spark_id: row.spark_id,
      message: row.message,
      created_at: row.created_at,
      user: {
        id: row.id,
        name: row.name,
        email: row.email,
        age: row.age,
        city: row.city,
        interests: row.interests,
        latitude: row.latitude,
        longitude: row.longitude
      }
    }));

    return NextResponse.json({
      success: true,
      data: pendingSparks,
      meta: {
        total: pendingSparks.length
      }
    });

  } catch (error) {
    console.error('Sparks pending error:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching pending sparks' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
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

    const { receiver_id, message } = await request.json();

    if (!receiver_id) {
      return NextResponse.json(
        { success: false, message: 'Receiver ID is required' },
        { status: 400 }
      );
    }

    // Check if receiver exists
    const receiverCheck = await db.query('SELECT id FROM users WHERE id = $1', [receiver_id]);
    if (receiverCheck.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Check if spark already exists
    const existingSpark = await db.query(
      'SELECT id FROM sparks WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)',
      [currentUser.id, receiver_id]
    );

    if (existingSpark.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Spark already exists between these users' },
        { status: 409 }
      );
    }

    // Create new spark
    const insertQuery = `
      INSERT INTO sparks (sender_id, receiver_id, message)
      VALUES ($1, $2, $3)
      RETURNING id, created_at
    `;

    const result = await db.query(insertQuery, [currentUser.id, receiver_id, message || '']);

    return NextResponse.json({
      success: true,
      message: 'Spark sent successfully',
      data: {
        spark_id: result.rows[0].id,
        created_at: result.rows[0].created_at
      }
    });

  } catch (error) {
    console.error('Send spark error:', error);
    return NextResponse.json(
      { success: false, message: 'Error sending spark' },
      { status: 500 }
    );
  }
}
