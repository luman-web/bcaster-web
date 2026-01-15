import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import pool from '@/lib/db'

// GET /api/user
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session || !session.user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  try {
    const client = await pool.connect()
    
    try {
      const result = await client.query(
        `SELECT u.id, u.name, u.email, u."emailVerified", u.image, u.profile_image_id, 
                u.image_cropped, u.image_preview, u.created_at, u.updated_at,
                ui.original_url
         FROM users u
         LEFT JOIN user_images ui ON u.profile_image_id = ui.id
         WHERE u.id = $1`,
        [session.user.id]
      )

      if (result.rows.length === 0) {
        return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 })
      }

      const user = result.rows[0]
      
      return new Response(JSON.stringify(user), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Database error:', error)
    return new Response(JSON.stringify({ error: 'Database error' }), { status: 500 })
  }
}

// PUT /api/user
export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session || !session.user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  try {
    const body = await req.json()
    const { profile_image_id, image_cropped, image_preview } = body
    const client = await pool.connect()
    
    try {
      // Build dynamic query based on provided fields
      const updates = []
      const values = []
      let paramIndex = 1

      if (profile_image_id !== undefined) {
        updates.push(`profile_image_id = $${paramIndex++}`)
        values.push(profile_image_id)
      }
      if (image_cropped !== undefined) {
        updates.push(`image_cropped = $${paramIndex++}`)
        values.push(image_cropped)
      }
      if (image_preview !== undefined) {
        updates.push(`image_preview = $${paramIndex++}`)
        values.push(image_preview)
      }

      if (updates.length === 0) {
        return new Response(JSON.stringify({ error: 'No fields provided' }), { status: 400 })
      }

      updates.push(`updated_at = NOW()`)
      values.push(session.user.id)

      const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`
      
      const result = await client.query(query, values)

      if (result.rows.length === 0) {
        return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 })
      }

      return new Response(JSON.stringify({ 
        success: true, 
        modified: result.rowCount,
        user: result.rows[0]
      }), {
        status: 200,
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Database error:', error)
    return new Response(JSON.stringify({ error: 'Database error' }), { status: 500 })
  }
}
