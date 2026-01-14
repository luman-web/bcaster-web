// /app/api/s3-upload/route.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

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
    const formData = await req.formData()
    const file = formData.get('file') as File
    const filename = formData.get('filename') as string

    if (!file || !filename) {
      return Response.json(
        { success: false, error: 'Missing file or filename' },
        { status: 400 }
      )
    }

    console.log(`[S3 Upload] Uploading file: ${filename} to bucket: ${process.env.S3_BUCKET_NAME}`)

    // Convert file to buffer
    const buffer = await file.arrayBuffer()

    // Upload directly to S3 (server-side, no CORS issues)
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: filename,
      Body: Buffer.from(buffer),
      ContentType: file.type,
    })

    await s3.send(command)

    console.log(`[S3 Upload] Successfully uploaded: ${filename}`)
    return Response.json({ success: true, message: `Successfully uploaded ${filename}` })
  } catch (error) {
    console.error('Error uploading file to S3:', error)
    return Response.json(
      { success: false, error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
