import React from 'react'
import { Image } from 'antd'

interface PreviewImageProps {
  imageUrl: string
  originalImageUrl?: string | null
}

const PreviewImage: React.FC<PreviewImageProps> = ({ imageUrl, originalImageUrl }) => {
  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <Image
        src={imageUrl}
        alt="Profile"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          cursor: 'pointer'
        }}
        preview={{
          src: originalImageUrl || imageUrl,
          mask: false,
          toolbarRender: () => null
        }}
      />
    </div>
  )
}

export default PreviewImage