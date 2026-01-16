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

    const { user_id } = await request.json()

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const currentUserId = session.user.id

    // Update the edge to set friend_request_status to 'declined' (stays as following)
    const result = await pool.query(
      `UPDATE user_edges 
       SET friend_request_status = 'declined', updated_at = NOW()
       WHERE requester_id = $1 AND receiver_id = $2 AND status = 'following' AND friend_request_status = 'pending'
       RETURNING id, status, friend_request_status`,
      [user_id, currentUserId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Friend request not found' },
        { status: 404 }
      )
    }

    // Delete the friend request event notification
    await pool.query(
      `DELETE FROM user_events 
       WHERE user_id = $1 AND event_type = 'friend.request' AND actor_id = $2`,
      [currentUserId, user_id]
    )

    return NextResponse.json({
      message: 'Friend request rejected',
      status: result.rows[0].status,
      friend_request_status: result.rows[0].friend_request_status
    })
  } catch (error) {
    console.error('Error rejecting friend request:', error)
    return NextResponse.json(
      { error: 'Failed to reject friend request' },
      { status: 500 }
    )
  }
}
