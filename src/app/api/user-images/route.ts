import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import pool from '@/lib/db'

// POST /api/user-images - Create a new user image record
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || !session.user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  try {
    const { original_url, preview_url, width, height, mime_type } = await req.json()

    if (!original_url) {
      return new Response(JSON.stringify({ error: 'original_url is required' }), { status: 400 })
    }

    const client = await pool.connect()

    try {
      const result = await client.query(
        `INSERT INTO user_images (user_id, original_url, preview_url, width, height, mime_type)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, user_id, original_url, preview_url, width, height, mime_type, created_at, updated_at`,
        [session.user.id, original_url, preview_url || null, width || null, height || null, mime_type || 'image/jpeg']
      )

      if (result.rows.length === 0) {
        return new Response(JSON.stringify({ error: 'Failed to create image record' }), { status: 500 })
      }

      return new Response(JSON.stringify(result.rows[0]), {
        status: 201,
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

// GET /api/user-images - Get all user images
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session || !session.user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  try {
    const client = await pool.connect()

    try {
      const result = await client.query(
        `SELECT id, user_id, original_url, preview_url, width, height, mime_type, created_at, updated_at
         FROM user_images
         WHERE user_id = $1
         ORDER BY created_at DESC`,
        [session.user.id]
      )

      return new Response(JSON.stringify(result.rows), {
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
