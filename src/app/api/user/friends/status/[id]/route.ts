import { auth } from '@/auth'
import pool from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: targetUserId } = params

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Check outgoing relationship (current user sent request to target)
    const outgoingResult = await pool.query(
      'SELECT status FROM user_edges WHERE requester_id = $1 AND receiver_id = $2',
      [session.user.id, targetUserId]
    )

    if (outgoingResult.rows.length > 0) {
      return NextResponse.json({
        status: outgoingResult.rows[0].status,
        direction: 'outgoing'
      })
    }

    // Check incoming relationship (target sent request to current user)
    const incomingResult = await pool.query(
      'SELECT status, id FROM user_edges WHERE requester_id = $1 AND receiver_id = $2',
      [targetUserId, session.user.id]
    )

    if (incomingResult.rows.length > 0) {
      return NextResponse.json({
        status: incomingResult.rows[0].status,
        direction: 'incoming',
        edgeId: incomingResult.rows[0].id
      })
    }

    return NextResponse.json({
      status: null
    })
  } catch (error) {
    console.error('Error fetching relationship status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch relationship status' },
      { status: 500 }
    )
  }
}
