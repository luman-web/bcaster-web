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
        'SELECT id, name, email, "emailVerified", image, created_at, updated_at FROM users WHERE id = $1',
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
    const { image } = await req.json()
    const client = await pool.connect()
    
    try {
      const result = await client.query(
        'UPDATE users SET image = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [image, session.user.id]
      )

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
