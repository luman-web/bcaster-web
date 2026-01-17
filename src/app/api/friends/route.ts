import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import pool from '@/lib/db'

// GET /api/friends?type=friends|requests|followers|outgoing|blocked
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session || !session.user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'friends'
    const userId = session.user.id

    const client = await pool.connect()
    
    try {
      let query = ''
      let params: (string | null)[] = []

      switch (type) {
        case 'friends':
          // Get all friends (status='friend')
          query = `
            SELECT u.id, u.name, u.email, u.image_preview
            FROM users u
            INNER JOIN user_edges ue ON u.id = ue.receiver_id
            WHERE ue.requester_id = $1 AND ue.status = 'friend'
            ORDER BY u.name
          `
          params = [userId]
          break

        case 'requests':
          // Get incoming friend requests (where you are receiver with pending request)
          query = `
            SELECT u.id, u.name, u.email, u.image_preview
            FROM users u
            INNER JOIN user_edges ue ON u.id = ue.requester_id
            WHERE ue.receiver_id = $1 AND ue.status = 'following' AND ue.friend_request_status = 'pending'
            ORDER BY ue.created_at DESC
          `
          params = [userId]
          break

        case 'followers':
          // Get all followers (status='following', any request status including null)
          query = `
            SELECT u.id, u.name, u.email, u.image_preview
            FROM users u
            INNER JOIN user_edges ue ON u.id = ue.requester_id
            WHERE ue.receiver_id = $1 AND ue.status = 'following'
            ORDER BY ue.created_at DESC
          `
          params = [userId]
          break

        case 'outgoing':
          // Get outgoing requests (where you are requester with following status and request status)
          query = `
            SELECT u.id, u.name, u.email, u.image_preview
            FROM users u
            INNER JOIN user_edges ue ON u.id = ue.receiver_id
            WHERE ue.requester_id = $1 AND ue.status = 'following' AND ue.friend_request_status IN ('pending', 'declined')
            ORDER BY ue.created_at DESC
          `
          params = [userId]
          break

        case 'blocked':
          // Get blocked users
          query = `
            SELECT u.id, u.name, u.email, u.image_preview
            FROM users u
            INNER JOIN user_edges ue ON u.id = ue.receiver_id
            WHERE ue.requester_id = $1 AND ue.status = 'blocked'
            ORDER BY ue.created_at DESC
          `
          params = [userId]
          break

        case 'following':
          // Get users we're following (just following, no request)
          query = `
            SELECT u.id, u.name, u.email, u.image_preview
            FROM users u
            INNER JOIN user_edges ue ON u.id = ue.receiver_id
            WHERE ue.requester_id = $1 AND ue.status = 'following' AND ue.friend_request_status IS NULL
            ORDER BY ue.created_at DESC
          `
          params = [userId]
          break

        default:
          return new Response(JSON.stringify({ error: 'Invalid type' }), { status: 400 })
      }

      const result = await client.query(query, params)

      return new Response(JSON.stringify(result.rows), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Database error:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch friends' }), { status: 500 })
  }
}
