import { NextRequest } from 'next/server'
import pool from '@/lib/db'

// GET /api/user/[id] - Public endpoint to fetch user profile data
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = params.id

  if (!userId) {
    return new Response(JSON.stringify({ error: 'User ID is required' }), { status: 400 })
  }

  try {
    const client = await pool.connect()
    
    try {
      // Only select public fields for guest viewing
      const result = await client.query(
        'SELECT id, name, image_cropped, image_preview, created_at FROM users WHERE id = $1',
        [userId]
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