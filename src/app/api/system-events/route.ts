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

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Fetch system events
    const result = await pool.query(
      `SELECT 
        id, 
        event_type, 
        actor_id, 
        related_id, 
        data,
        is_read, 
        created_at
       FROM system_events 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [session.user.id, limit, offset]
    )

    // Fetch count of unread events
    const countResult = await pool.query(
      'SELECT COUNT(*) as unread_count FROM system_events WHERE user_id = $1 AND is_read = FALSE',
      [session.user.id]
    )

    return NextResponse.json({
      events: result.rows,
      unread_count: parseInt(countResult.rows[0].unread_count)
    })
  } catch (error) {
    console.error('Error fetching system events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch system events' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { event_ids } = await request.json()

    if (!event_ids || !Array.isArray(event_ids) || event_ids.length === 0) {
      return NextResponse.json(
        { error: 'Event IDs are required' },
        { status: 400 }
      )
    }

    // Mark events as read
    const placeholders = event_ids.map((_, i) => `$${i + 2}`).join(',')
    const query = `UPDATE system_events 
                   SET is_read = TRUE 
                   WHERE user_id = $1 AND id IN (${placeholders})
                   RETURNING id`

    const result = await pool.query(query, [session.user.id, ...event_ids])

    return NextResponse.json({
      message: 'Events marked as read',
      marked_count: result.rows.length
    })
  } catch (error) {
    console.error('Error marking events as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark events as read' },
      { status: 500 }
    )
  }
}
