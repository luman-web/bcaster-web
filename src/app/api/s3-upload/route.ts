// /app/api/s3-upload/route.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3 = new S3Client({
  region: 'ru-1', // Use Selectel's region
  endpoint: process.env.S3_BUCKET_ENDPOINT,
  forcePathStyle: true, // Required for S3-compatible services like Selectel
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
})

export async function POST(req: Request) {
  const { filename, fileType } = await req.json()

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: filename,
    ContentType: fileType,
  })

  const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 })

  return Response.json({ signedUrl })
}
