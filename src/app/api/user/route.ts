import { NextRequest } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'
import { auth } from '@/auth'

const uri = process.env.MONGODB_URI!
const options = {}
let client: MongoClient
let clientPromise: Promise<MongoClient>

declare global {
  var _mongoClientPromise: Promise<MongoClient>
}

// MongoDB connection reuse
if (!global._mongoClientPromise) {
  client = new MongoClient(uri, options)
  global._mongoClientPromise = client.connect()
}
clientPromise = global._mongoClientPromise

// GET /api/user
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session || !session.user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const client = await clientPromise
  const db = client.db('test')

  const user = await db.collection('users').findOne({ _id: new ObjectId(session.user.id) })

  if (!user) {
    return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 })
  }

  return new Response(JSON.stringify(user), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

// PUT /api/user
export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session || !session.user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const { image } = await req.json()
  const client = await clientPromise
  const db = client.db('test')

  const result = await db.collection('users').updateOne(
    { _id: new ObjectId(session.user.id) },
    { $set: { image } }
  )

  return new Response(JSON.stringify({ success: true, modified: result.modifiedCount }), {
    status: 200,
  })
}
