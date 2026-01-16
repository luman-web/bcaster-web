import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import pool from '@/lib/db'

// POST /api/friends/remove
// Remove a friend or cancel friend request
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || !session.user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  try {
    const { user_id } = await req.json()
    const current_user_id = session.user.id

    const client = await pool.connect()
    try {
      // Check if current user is requester or receiver
      const requesterResult = await client.query(
        `SELECT status FROM user_edges 
         WHERE requester_id = $1 AND receiver_id = $2`,
        [current_user_id, user_id]
      )

      const receiverResult = await client.query(
        `SELECT status FROM user_edges 
         WHERE requester_id = $1 AND receiver_id = $2`,
        [user_id, current_user_id]
      )

      // Determine if current user is requester or receiver
      let isRequester = false
      let status = null

      if (requesterResult.rows.length > 0) {
        isRequester = true
        status = requesterResult.rows[0].status
      } else if (receiverResult.rows.length > 0) {
        isRequester = false
        status = receiverResult.rows[0].status
      }

      if (!status) {
        return new Response(JSON.stringify({ error: 'Relationship not found' }), { status: 404 })
      }

      if (status === 'friend') {
        if (isRequester) {
          // Requester removes friend: delete original edge and create new edge with switched roles
          // Delete original edge (requester_id=current, receiver_id=user)
          await client.query(
            `DELETE FROM user_edges 
             WHERE requester_id = $1 AND receiver_id = $2`,
            [current_user_id, user_id]
          )
          
          // Create new edge with switched roles
          await client.query(
            `INSERT INTO user_edges (requester_id, receiver_id, status, friend_request_status, created_at, updated_at)
             VALUES ($1, $2, $3, $4, NOW(), NOW())
             ON CONFLICT (requester_id, receiver_id) DO UPDATE SET 
               status = $3, friend_request_status = $4, updated_at = NOW()`,
            [user_id, current_user_id, 'following', 'declined']
          )
        } else {
          // Receiver removes friend: update the edge to following with declined status
          await client.query(
            `UPDATE user_edges 
             SET status = 'following', friend_request_status = 'declined', updated_at = NOW()
             WHERE requester_id = $1 AND receiver_id = $2`,
            [user_id, current_user_id]
          )
        }
      } else if (status === 'following') {
        // Delete following (with any request status)
        if (isRequester) {
          await client.query(
            `DELETE FROM user_edges 
             WHERE requester_id = $1 AND receiver_id = $2`,
            [current_user_id, user_id]
          )
        } else {
          await client.query(
            `DELETE FROM user_edges 
             WHERE requester_id = $1 AND receiver_id = $2`,
            [user_id, current_user_id]
          )
        }
        
        // Also delete the friend request notification if it exists
        await client.query(
          `DELETE FROM user_events 
           WHERE user_id = $1 AND event_type = 'friend.request' AND actor_id = $2`,
          [current_user_id, user_id]
        )
      }

      return new Response(JSON.stringify({ success: true }), { status: 200 })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error removing friend:', error)
    return new Response(JSON.stringify({ error: 'Failed to remove friend' }), { status: 500 })
  }
}
