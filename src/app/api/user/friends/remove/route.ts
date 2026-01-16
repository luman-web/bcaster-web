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

    // Check current relationship status
    const result = await pool.query(
      `SELECT status FROM user_edges 
       WHERE requester_id = $1 AND receiver_id = $2`,
      [currentUserId, user_id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Friend relationship not found' },
        { status: 404 }
      )
    }

    const status = result.rows[0].status

    if (status === 'friends') {
      // Remove friend: mark as removed
      await pool.query(
        `UPDATE user_edges 
         SET status = 'removed', updated_at = NOW()
         WHERE requester_id = $1 AND receiver_id = $2`,
        [currentUserId, user_id]
      )
      
      // Delete reciprocal friend relationship
      await pool.query(
        `DELETE FROM user_edges 
         WHERE requester_id = $1 AND receiver_id = $2 AND status = 'friends'`,
        [user_id, currentUserId]
      )
    } else if (status === 'outgoing_request') {
      // Cancel outgoing request
      await pool.query(
        `DELETE FROM user_edges 
         WHERE requester_id = $1 AND receiver_id = $2 AND status = 'outgoing_request'`,
        [currentUserId, user_id]
      )
    } else {
      // Delete any other relationship type
      await pool.query(
        `DELETE FROM user_edges 
         WHERE requester_id = $1 AND receiver_id = $2`,
        [currentUserId, user_id]
      )
    }

    return NextResponse.json({
      message: 'Friend removed successfully'
    })
  } catch (error) {
    console.error('Error removing friend:', error)
    return NextResponse.json(
      { error: 'Failed to remove friend' },
      { status: 500 }
    )
  }
}
