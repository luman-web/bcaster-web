'use client'

import { useEffect, useState } from 'react'
// styles
import styles from './styles.module.scss'

export default function ProfileImage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  useEffect(() => {
    // Updated with correct full object key
    const publicImageUrl =
      'https://api.ru-1.storage.selcloud.ru/v2/panel/links/d585f900cde43169ab4835949606e117961a6804?inline=true'
    setImageUrl(publicImageUrl)
  }, [])

  async function handleChangeFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const res = await fetch('/api/s3-upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: `profile-image/${file.name}`, // 👈 important
        fileType: file.type,
      }),
    })

    const { signedUrl } = await res.json()

    const upload = await fetch(signedUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    })

    if (upload.ok) {
      console.log('Upload successful')
    } else {
      console.error('Upload failed')
    }
  }

  return (
    <div>
      {imageUrl && (
        <img
          src={imageUrl}
          alt="Profile"
          style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
        />
      )}
      <input type="file" onChange={handleChangeFile} />
    </div>
  )
}
