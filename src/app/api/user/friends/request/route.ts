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

    const { receiver_id } = await request.json()

    if (!receiver_id) {
      return NextResponse.json(
        { error: 'Receiver ID is required' },
        { status: 400 }
      )
    }

    const requester_id = session.user.id

    if (requester_id === receiver_id) {
      return NextResponse.json(
        { error: 'Cannot send friend request to yourself' },
        { status: 400 }
      )
    }

    // Check if user exists
    const userCheck = await pool.query(
      'SELECT id FROM users WHERE id = $1',
      [receiver_id]
    )

    if (userCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if edge already exists
    const existingEdge = await pool.query(
      'SELECT id, status FROM user_edges WHERE requester_id = $1 AND receiver_id = $2',
      [requester_id, receiver_id]
    )

    if (existingEdge.rows.length > 0) {
      const existingStatus = existingEdge.rows[0].status
      return NextResponse.json(
        { error: `Friend request already exists with status: ${existingStatus}` },
        { status: 400 }
      )
    }

    // Create friend request edge
    const result = await pool.query(
      'INSERT INTO user_edges (requester_id, receiver_id, status) VALUES ($1, $2, $3) RETURNING id, status',
      [requester_id, receiver_id, 'pending']
    )

    const edgeId = result.rows[0].id

    // Create system event for receiver
    await pool.query(
      `INSERT INTO system_events (user_id, event_type, actor_id, related_id, data, is_read)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        receiver_id,
        'friend.request',
        requester_id,
        edgeId,
        JSON.stringify({
          requester_id,
          requester_name: session.user.name,
          requester_image: session.user.image,
        }),
        false
      ]
    )

    // Send WebSocket message to receiver
    try {
      const wsResponse = await fetch('http://localhost:3001/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: receiver_id,
          eventType: 'friend.request',
          data: {
            requester_id,
            requester_name: session.user.name,
            requester_image: session.user.image,
          }
        })
      })

      if (!wsResponse.ok) {
        console.error('Failed to send WebSocket notification')
      }
    } catch (error) {
      console.error('Error sending WebSocket notification:', error)
    }

    return NextResponse.json({
      id: result.rows[0].id,
      status: result.rows[0].status,
      message: 'Friend request sent successfully'
    })
  } catch (error) {
    console.error('Error sending friend request:', error)
    return NextResponse.json(
      { error: 'Failed to send friend request' },
      { status: 500 }
    )
  }
}
