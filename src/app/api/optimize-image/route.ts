import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const width = parseInt(formData.get('width') as string) || 250
    const height = parseInt(formData.get('height') as string) || 250
    const quality = parseInt(formData.get('quality') as string) || 85

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Optimize image using sharp
    const optimizedBuffer = await sharp(buffer)
      .resize(width, height, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({
        quality: quality,
        progressive: true,
        mozjpeg: true
      })
      .toBuffer()

    // Convert back to base64 for frontend use
    const base64 = `data:image/jpeg;base64,${optimizedBuffer.toString('base64')}`

    return NextResponse.json({
      success: true,
      optimizedImage: base64,
      originalSize: buffer.length,
      optimizedSize: optimizedBuffer.length,
      compressionRatio: ((buffer.length - optimizedBuffer.length) / buffer.length * 100).toFixed(2)
    })

  } catch (error) {
    console.error('Error optimizing image:', error)
    return NextResponse.json(
      { error: 'Failed to optimize image' },
      { status: 500 }
    )
  }
}