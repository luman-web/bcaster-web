'use client'

// styles
import style from './styles.module.scss'
// components
import SelectImageModal from '../modals/SelectImage/index'
import UploadedImage from './UploadedImage'

import { useState, useEffect } from 'react'
import { SessionProvider, useSession } from 'next-auth/react'
import { useUserProfileStore } from '@/store/userProfileStore'
import { Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import Placeholder from './Placeholder'

interface ProfileImageContentProps {
  userId?: string
}

function ProfileImageContent({ userId }: ProfileImageContentProps) {
  const { data: session } = useSession()
  const triggerProfileImageUpdate = useUserProfileStore((state) => state.triggerProfileImageUpdate)
  const profileImageUpdateTrigger = useUserProfileStore((state) => state.profileImageUpdateTrigger)
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
  }, [session, profileImageUpdateTrigger])

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
      // Get current user's profile image info including user_images data
      const userResponse = await fetch('/api/user')
      if (userResponse.ok) {
        const userData = await userResponse.json()
        const baseUrl = process.env.NEXT_PUBLIC_S3_BASE_URL
        
        if (baseUrl) {
          // Collect all image files to delete from both users table and user_images data
          const imagesToDelete = [
            userData.original_url,      // Original full image
            userData.image_cropped,     // 250x250 cropped
            userData.image_preview      // 50x50 preview of cropped
          ].filter(url => url && url.startsWith(baseUrl))

          // Also delete the original-preview image if profile_image_id exists
          // The original-preview is derived from the profile_image_id by replacing -preview.jpg with -original-preview.jpg
          if (userData.image_preview && userData.image_preview.startsWith(baseUrl)) {
            const originalPreviewUrl = userData.image_preview.replace('-preview.jpg', '-original-preview.jpg')
            if (!imagesToDelete.includes(originalPreviewUrl)) {
              imagesToDelete.push(originalPreviewUrl)
            }
          }

          // Delete all images from S3
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
        // Trigger store update to notify all components
        triggerProfileImageUpdate()
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
