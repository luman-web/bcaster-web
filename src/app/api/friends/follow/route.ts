import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import pool from '@/lib/db'

// POST /api/friends/follow
// Create a following relationship (A follows B)
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || !session.user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  try {
    const { user_id } = await req.json()
    const requester_id = session.user.id

    if (!user_id || user_id === requester_id) {
      return new Response(JSON.stringify({ error: 'Invalid user ID' }), { status: 400 })
    }

    const client = await pool.connect()
    try {
      // Create or update edge to set status='following'
      await client.query(
        `INSERT INTO user_edges (requester_id, receiver_id, status)
         VALUES ($1, $2, 'following')
         ON CONFLICT (requester_id, receiver_id) DO UPDATE
         SET status = 'following', updated_at = NOW()`,
        [requester_id, user_id]
      )

      return new Response(JSON.stringify({ success: true }), { status: 200 })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error creating follow relationship:', error)
    return new Response(JSON.stringify({ error: 'Failed to follow user' }), { status: 500 })
  }
}
