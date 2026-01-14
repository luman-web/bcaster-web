// /app/api/s3-delete/route.ts
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'

const s3 = new S3Client({
  region: 'ru-1', // Use Selectel's region
  endpoint: `https://${process.env.S3_BUCKET_ENDPOINT}`,
  forcePathStyle: true, // Required for S3-compatible services like Selectel
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
})

export async function POST(req: Request) {
  try {
    const { filename } = await req.json()

    const command = new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: filename,
    })

    // Delete the file directly on the server side
    await s3.send(command)

    return Response.json({ success: true, message: `Successfully deleted ${filename}` })
  } catch (error) {
    console.error('Error deleting file:', error)
    return Response.json({ success: false, error: 'Failed to delete file' }, { status: 500 })
  }
}