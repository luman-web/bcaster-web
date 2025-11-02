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

function ProfileImageContent() {
  const { data: session } = useSession()
  const [selectImageModalShown, showSelectImageModal] = useState(false)
  const [userImageUrl, setUserImageUrl] = useState<string | null>(null)
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchUserImage = async () => {
    if (!session?.user?.id) return
    
    try {
      const response = await fetch('/api/user')
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
      // First, get current user's image URLs to delete from Selectel
      const userResponse = await fetch('/api/user')
      if (userResponse.ok) {
        const userData = await userResponse.json()
        const baseUrl = process.env.NEXT_PUBLIC_S3_BASE_URL
        
        if (baseUrl) {
          const imageUrls = [
            userData.image_original,
            userData.image_cropped,
            userData.image_preview
          ].filter(url => url && url.startsWith(baseUrl))

          // Delete images from Selectel
          for (const imageUrl of imageUrls) {
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

      // Clear image URLs from database
      const updateResponse = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: null,
          image_original: null,
          image_cropped: null,
          image_preview: null
        }),
      })

      if (updateResponse.ok) {
        console.log('Profile images cleared from database')
        setUserImageUrl(null) // Update local state
        setOriginalImageUrl(null) // Clear original image URL
      } else {
        console.error('Failed to clear profile images from database')
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
          onDelete={handleDeleteImage}
          onSelectImage={handleSelectImageClick}
          isDeleting={isDeleting}
        />
      ) : (
        <Placeholder selectImage={handleSelectImageClick} />
      )}
      <SelectImageModal
        isOpened={selectImageModalShown}
        close={handleModalClose}
      />
    </div>
  )
}

export default function ProfileImage() {
  return (
    <SessionProvider>
      <ProfileImageContent />
    </SessionProvider>
  )
}
