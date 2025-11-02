'use client'

// styles
import style from '../../Profile/Image/styles.module.scss'
import PlaceholderPreview from './PlaceholderPreview'

import { useState, useEffect } from 'react'
import { Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import PreviewImage from './PreviewImage'

interface ProfileImagePreviewProps {
  userId: string
}

export default function ProfileImagePreview({ userId }: ProfileImagePreviewProps) {
  const [userImageUrl, setUserImageUrl] = useState<string | null>(null)
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUserImage = async () => {
    try {
      const response = await fetch(`/api/user/${userId}`)
      if (response.ok) {
        const userData = await response.json()
        setUserImageUrl(userData.image_cropped || null)
        setOriginalImageUrl(userData.image_original || null)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      fetchUserImage()
    }
  }, [userId])

  if (isLoading) {
    return (
      <div className={style.profileImageWrapper}>
        <div className={style.placeholder}>
          <Spin
            indicator={
              <LoadingOutlined
                style={{
                  fontSize: 24,
                  color: '#ccc',
                }}
                spin
              />
            }
          />
        </div>
      </div>
    )
  }

  return (
    <div className={style.profileImageWrapper}>
      {userImageUrl ? (
        <PreviewImage 
          imageUrl={userImageUrl} 
          originalImageUrl={originalImageUrl} 
        />
      ) : (
        <PlaceholderPreview />
      )}
    </div>
  )
}