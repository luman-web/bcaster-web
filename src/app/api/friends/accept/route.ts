import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import pool from '@/lib/db'

// POST /api/friends/accept-request
// Accept an incoming friend request
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || !session.user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  try {
    const { requester_id } = await req.json()
    const receiver_id = session.user.id

    if (!requester_id) {
      return new Response(JSON.stringify({ error: 'Requester ID is required' }), { status: 400 })
    }

    const client = await pool.connect()
    try {
      // Update incoming request to friend status and set friend_request_status to accepted
      const updateResult = await client.query(
        `UPDATE user_edges 
         SET status = 'friend', friend_request_status = 'accepted', updated_at = NOW()
         WHERE requester_id = $1 AND receiver_id = $2 AND status = 'following' AND friend_request_status IN ('pending', 'declined')
         RETURNING requester_id, receiver_id`,
        [requester_id, receiver_id]
      )

      if (updateResult.rows.length === 0) {
        return new Response(JSON.stringify({ error: 'Request not found' }), { status: 404 })
      }

      // Check if there's already a pending request in the opposite direction
      const reverseRequestResult = await client.query(
        'SELECT id, status, friend_request_status FROM user_edges WHERE requester_id = $1 AND receiver_id = $2',
        [receiver_id, requester_id]
      )

      // Only create reciprocal relationship if there's no pending request from receiver to requester
      if (reverseRequestResult.rows.length === 0 || reverseRequestResult.rows[0].friend_request_status !== 'pending') {
        // Create reciprocal friend relationship
        await client.query(
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
      await client.query(
        `DELETE FROM user_events 
         WHERE user_id = $1 AND event_type = 'friend.request' AND actor_id = $2`,
        [receiver_id, requester_id]
      )

      return new Response(JSON.stringify({ success: true }), { status: 200 })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error accepting friend request:', error)
    return new Response(JSON.stringify({ error: 'Failed to accept request' }), { status: 500 })
  }
}
