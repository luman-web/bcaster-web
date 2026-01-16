import { auth } from '@/auth'
import pool from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { edge_id } = await request.json()

    if (!edge_id) {
      return NextResponse.json(
        { error: 'Edge ID is required' },
        { status: 400 }
      )
    }

    // Update the edge status to friend and set friend_request_status to accepted
    const result = await pool.query(
      'UPDATE user_edges SET status = $1, friend_request_status = $2 WHERE id = $3 AND receiver_id = $4 RETURNING requester_id, receiver_id',
      ['friend', 'accepted', edge_id, session.user.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Edge not found or unauthorized' },
        { status: 404 }
      )
    }

    const { requester_id, receiver_id } = result.rows[0]

    // Check if there's already a pending request in the opposite direction
    const reverseRequestResult = await pool.query(
      'SELECT id, status, friend_request_status FROM user_edges WHERE requester_id = $1 AND receiver_id = $2',
      [receiver_id, requester_id]
    )

    // Only create reciprocal relationship if there's no pending request from receiver to requester
    if (reverseRequestResult.rows.length === 0 || reverseRequestResult.rows[0].friend_request_status !== 'pending') {
      // Create reciprocal friend relationship
      await pool.query(
        `INSERT INTO user_edges (requester_id, receiver_id, status, friend_request_status)
         VALUES ($1, $2, 'friend', 'accepted')
         ON CONFLICT (requester_id, receiver_id) DO UPDATE
         SET status = 'friend', friend_request_status = 'accepted', updated_at = NOW()`,
        [receiver_id, requester_id]
      )
    }
    // If there's a pending request from receiver to requester, leave it as is
    // (both need to accept their respective requests)

    // Delete the friend request event notification
    await pool.query(
      `DELETE FROM user_events 
       WHERE user_id = $1 AND event_type = 'friend.request' AND actor_id = $2`,
      [receiver_id, requester_id]
    )

    return NextResponse.json({
      message: 'Friend request accepted successfully',
      edge: result.rows[0]
    })
  } catch (error) {
    console.error('Error accepting friend request:', error)
    return NextResponse.json(
      { error: 'Failed to accept friend request' },
      { status: 500 }
    )
  }
}
