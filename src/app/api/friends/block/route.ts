import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import pool from '@/lib/db'

// POST /api/friends/block
// Block or unblock a user
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
      // Check if already blocked
      const result = await client.query(
        `SELECT id FROM user_edges 
         WHERE requester_id = $1 AND receiver_id = $2 AND status = 'blocked'`,
        [current_user_id, user_id]
      )

      if (result.rows.length > 0) {
        // Unblock
        await client.query(
          `DELETE FROM user_edges 
           WHERE requester_id = $1 AND receiver_id = $2 AND status = 'blocked'`,
          [current_user_id, user_id]
        )
      } else {
        // Block: first delete any existing relationship
        await client.query(
          `DELETE FROM user_edges 
           WHERE (requester_id = $1 AND receiver_id = $2) OR (requester_id = $2 AND receiver_id = $1)`,
          [current_user_id, user_id]
        )

        // Create block relationship
        await client.query(
          `INSERT INTO user_edges (requester_id, receiver_id, status)
           VALUES ($1, $2, 'blocked')`,
          [current_user_id, user_id]
        )
      }

      return new Response(JSON.stringify({ success: true }), { status: 200 })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error blocking user:', error)
    return new Response(JSON.stringify({ error: 'Failed to block user' }), { status: 500 })
  }
}
