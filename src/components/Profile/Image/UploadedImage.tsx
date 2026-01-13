import React from 'react'
import { Button, Popconfirm, Image } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import style from './styles.module.scss'

interface UploadedImageProps {
  imageUrl: string
  originalImageUrl?: string
  onDelete?: () => void
  onSelectImage?: () => void
  isDeleting: boolean
}

const UploadedImage: React.FC<UploadedImageProps> = ({
  imageUrl,
  originalImageUrl,
  onDelete,
  onSelectImage,
  isDeleting
}) => {
  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <Image
        src={imageUrl}
        alt="Profile"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          cursor: 'pointer',
        }}
        preview={{
          mask: false, // Remove the default preview mask overlay
          src: originalImageUrl || imageUrl, // Use original size for preview if available
          toolbarRender: () => null, // Remove all controls from the preview
        }}
      />
      {/* Trash icon in top-right corner */}
      {onDelete && (
        <Popconfirm
          title="Удалить фото профиля?"
          onConfirm={onDelete}
          okText="Да"
          cancelText="Отмена"
          disabled={isDeleting}
        >
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            size="small"
            disabled={isDeleting}
            className={style.profileImage}
          />
        </Popconfirm>
      )}
      {onSelectImage && (
        <div className={style.selectImage}>
          <Button size="small" style={{ width: '100%' }} onClick={onSelectImage}>
            <span>Выбрать фото</span>
          </Button>
        </div>
      )}
    </div>
  )
}

export default UploadedImage