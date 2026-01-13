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

    const { edge_id } = await request.json()

    if (!edge_id) {
      return NextResponse.json(
        { error: 'Edge ID is required' },
        { status: 400 }
      )
    }

    // Update the edge status to approved
    const result = await pool.query(
      'UPDATE user_edges SET status = $1 WHERE id = $2 AND receiver_id = $3 RETURNING requester_id, receiver_id',
      ['approved', edge_id, session.user.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Edge not found or unauthorized' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Friend request accepted successfully',
      edge: result.rows[0]
    })
  } catch (error) {
    console.error('Error accepting friend request:', error)
    return NextResponse.json(
      { error: 'Failed to accept friend request' },
      { status: 500 }
    )
  }
}
