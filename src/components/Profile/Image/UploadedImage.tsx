import React from 'react'
import { Button, Popconfirm } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import style from './styles.module.scss'

interface UploadedImageProps {
  imageUrl: string
  onDelete: () => void
  onSelectImage: () => void
  isDeleting: boolean
}

const UploadedImage: React.FC<UploadedImageProps> = ({
  imageUrl,
  onDelete,
  onSelectImage,
  isDeleting
}) => {
  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <img
        src={imageUrl}
        alt="Profile"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
      {/* Trash icon in top-right corner */}
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
      <div className={style.selectImage}>
        <Button size="small" style={{ width: '100%' }} onClick={onSelectImage}>
          <span>Выбрать фото</span>
        </Button>
      </div>
    </div>
  )
}

export default UploadedImage