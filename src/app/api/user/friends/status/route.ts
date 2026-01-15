import { auth } from '@/auth'
import pool from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const currentUserId = session.user.id

    // Check if there's an edge relationship between current user and the specified user
    const result = await pool.query(
      `SELECT status FROM user_edges 
       WHERE (requester_id = $1 AND receiver_id = $2) 
          OR (requester_id = $2 AND receiver_id = $1)
       LIMIT 1`,
      [currentUserId, userId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({
        status: null,
        message: 'No relationship found'
      })
    }

    return NextResponse.json({
      status: result.rows[0].status
    })
  } catch (error) {
    console.error('Error fetching friend status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch friend status' },
      { status: 500 }
    )
  }
}
