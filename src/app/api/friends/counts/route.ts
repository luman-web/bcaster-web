import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import pool from '@/lib/db'

// GET /api/friends/counts
// Get counts for all friend-related tabs
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session || !session.user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  try {
    const userId = session.user.id

    const [
      friendsResult,
      requestsResult,
      followersResult,
      outgoingResult,
      blockedResult,
    ] = await Promise.all([
      // Friends (count only one direction to match the friends list query)
      pool.query(
        `SELECT COUNT(DISTINCT ue.receiver_id) as count FROM user_edges ue
         WHERE ue.requester_id = $1 AND ue.status = 'friend'`,
        [userId]
      ),
      // Incoming requests
      pool.query(
        `SELECT COUNT(*) as count FROM user_edges 
         WHERE receiver_id = $1 AND status = 'following' AND friend_request_status = 'pending'`,
        [userId]
      ),
      // Followers
      pool.query(
        `SELECT COUNT(*) as count FROM user_edges 
         WHERE receiver_id = $1 AND status = 'following'`,
        [userId]
      ),
      // Outgoing requests
      pool.query(
        `SELECT COUNT(*) as count FROM user_edges 
         WHERE requester_id = $1 AND status = 'following' AND friend_request_status IN ('pending', 'declined')`,
        [userId]
      ),
      // Blocked users
      pool.query(
        `SELECT COUNT(*) as count FROM user_edges 
         WHERE requester_id = $1 AND status = 'blocked'`,
        [userId]
      ),
    ])

    return new Response(
      JSON.stringify({
        friends: Number(friendsResult.rows[0]?.count || 0),
        requests: Number(requestsResult.rows[0]?.count || 0),
        followers: Number(followersResult.rows[0]?.count || 0),
        outgoing: Number(outgoingResult.rows[0]?.count || 0),
        blocked: Number(blockedResult.rows[0]?.count || 0),
      }),
      { status: 200 }
    )
  } catch (error) {
    console.error('Error getting friend counts:', error)
    return new Response(JSON.stringify({ error: 'Failed to get counts' }), { status: 500 })
  }
}
