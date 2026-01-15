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

    // Update the edge status to 'rejected' (receiver rejects the request)
    // The edge stays in the database so they remain as a follower
    const result = await pool.query(
      `UPDATE user_edges 
       SET status = 'rejected', updated_at = NOW()
       WHERE requester_id = $1 AND receiver_id = $2
       RETURNING id, status`,
      [user_id, currentUserId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Friend request not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Friend request rejected',
      status: result.rows[0].status
    })
  } catch (error) {
    console.error('Error rejecting friend request:', error)
    return NextResponse.json(
      { error: 'Failed to reject friend request' },
      { status: 500 }
    )
  }
}
