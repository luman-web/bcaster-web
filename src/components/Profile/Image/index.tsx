'use client'

// styles
import style from './styles.module.scss'
// components
import SelectImageModal from '../modals/SelectImage/index'
import UploadedImage from './UploadedImage'

import { useState, useEffect } from 'react'
import { SessionProvider, useSession } from 'next-auth/react'
import { Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import Placeholder from './Placeholder'

interface ProfileImageContentProps {
  userId?: string
}

function ProfileImageContent({ userId }: ProfileImageContentProps) {
  const { data: session } = useSession()
  const [selectImageModalShown, showSelectImageModal] = useState(false)
  const [userImageUrl, setUserImageUrl] = useState<string | null>(null)
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const isCurrentUser = !userId || userId === session?.user?.id

  const fetchUserImage = async () => {
    if (!session?.user?.id) return
    
    try {
      const url = isCurrentUser ? '/api/user' : `/api/user/${userId}`
      const response = await fetch(url)
      if (response.ok) {
        const userData = await response.json()
        setUserImageUrl(userData.image_cropped || null)
        setOriginalImageUrl(userData.original_url || null)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUserImage()
  }, [session])

  const handleModalClose = () => {
    showSelectImageModal(false)
    // Refresh the image after saving
    fetchUserImage()
  }

  const handleSelectImageClick = () => {
    // Small delay to ensure proper focus management
    setTimeout(() => {
      showSelectImageModal(true)
    }, 0)
  }

  const handleDeleteImage = async () => {
    if (!session?.user?.id || !userImageUrl) return

    setIsDeleting(true)

    try {
      // Get current user's profile image info to delete from S3
      const userResponse = await fetch('/api/user')
      if (userResponse.ok) {
        const userData = await userResponse.json()
        const baseUrl = process.env.NEXT_PUBLIC_S3_BASE_URL
        
        if (baseUrl) {
          const imagesToDelete = [
            userData.original_url,
            userData.image_cropped,
            userData.image_preview
          ].filter(url => url && url.startsWith(baseUrl))

          // Delete images from S3
          for (const imageUrl of imagesToDelete) {
            try {
              const filename = imageUrl.replace(`${baseUrl}/`, '')
              
              const deleteResponse = await fetch('/api/s3-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename }),
              })

              const result = await deleteResponse.json()
              if (result.success) {
                console.log(`Deleted image: ${filename}`)
              } else {
                console.error(`Failed to delete image: ${filename}`)
              }
            } catch (error) {
              console.error(`Error deleting image ${imageUrl}:`, error)
            }
          }
        }
      }

      // Clear profile image from user record
      const updateResponse = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_image_id: null,
          image_cropped: null,
          image_preview: null
        }),
      })

      if (updateResponse.ok) {
        console.log('Profile images cleared from user record')
        setUserImageUrl(null)
        setOriginalImageUrl(null)
      } else {
        console.error('Failed to clear profile images')
      }

    } catch (error) {
      console.error('Error deleting profile image:', error)
    } finally {
      setIsDeleting(false)
    }
  }

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
        <UploadedImage
          imageUrl={userImageUrl}
          originalImageUrl={originalImageUrl || undefined}
          onDelete={isCurrentUser ? handleDeleteImage : undefined}
          onSelectImage={isCurrentUser ? handleSelectImageClick : undefined}
          isDeleting={isDeleting}
        />
      ) : (
        <Placeholder selectImage={isCurrentUser ? handleSelectImageClick : undefined} />
      )}
      {isCurrentUser && (
        <SelectImageModal
          isOpened={selectImageModalShown}
          close={handleModalClose}
        />
      )}
    </div>
  )
}

interface ProfileImageProps {
  userId?: string
}

export default function ProfileImage({ userId }: ProfileImageProps) {
  return (
    <SessionProvider>
      <ProfileImageContent userId={userId} />
    </SessionProvider>
  )
}
