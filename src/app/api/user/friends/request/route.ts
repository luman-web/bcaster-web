import { auth } from '@/auth'
import pool from '@/lib/db'
import { sendWebSocketNotification } from '@/lib/sendWebSocketNotification'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      )
    }

    const { receiver_id } = await request.json()

    if (!receiver_id) {
      return NextResponse.json(
        { error: 'ID получателя не указан' },
        { status: 400 }
      )
    }

    const requester_id = session.user.id

    if (requester_id === receiver_id) {
      return NextResponse.json(
        { error: 'Невозможно послать запрос себе же' },
        { status: 400 }
      )
    }

    // Check if user exists and get requester image
    const userCheck = await pool.query(
      'SELECT id FROM users WHERE id = $1',
      [receiver_id]
    )

    // Get requester's image
    const requesterData = await pool.query(
      'SELECT name, image_preview FROM users WHERE id = $1',
      [requester_id]
    )

    if (userCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      )
    }

    if (requesterData.rows.length === 0) {
      return NextResponse.json(
        { error: 'Контакт не был найден' },
        { status: 404 }
      )
    }

    const requesterImage = requesterData.rows[0].image_preview
    const requesterName = requesterData.rows[0].name

    // Check if edge already exists
    const existingEdge = await pool.query(
      'SELECT id, status FROM user_edges WHERE requester_id = $1 AND receiver_id = $2',
      [requester_id, receiver_id]
    )

    if (existingEdge.rows.length > 0) {
      const existingStatus = existingEdge.rows[0].status
      return NextResponse.json(
        { error: `Запрос в друзья уже существует в статусе: ${existingStatus}` },
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
      `INSERT INTO user_events (user_id, event_type, actor_id, related_id, data, is_read)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        receiver_id,
        'friend.request',
        requester_id,
        edgeId,
        JSON.stringify({
          requester_id,
          requester_name: requesterName,
          requester_image: requesterImage,
        }),
        false
      ]
    )

    console.log('send notification to requester', receiver_id)

    // Send WebSocket notification
    await sendWebSocketNotification({
      userId: receiver_id,
      eventType: `user_event.${receiver_id}`,
      data: {}
    })

    return NextResponse.json({
      id: result.rows[0].id,
      status: result.rows[0].status,
      message: 'Запроас в друзья успешно отправлен'
    })
  } catch (error) {
    console.error('Ошибка запроса в друзья:', error)
    return NextResponse.json(
      { error: 'Не удалось отправить запрос в друзья' },
      { status: 500 }
    )
  }
}
