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

    // Check if edge exists (can be in either direction)
    const result = await pool.query(
      `DELETE FROM user_edges 
       WHERE (requester_id = $1 AND receiver_id = $2) 
          OR (requester_id = $2 AND receiver_id = $1)
       RETURNING id, requester_id, receiver_id`,
      [currentUserId, user_id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Friend relationship not found' },
        { status: 404 }
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
