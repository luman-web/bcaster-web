import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { createAvatar } from '@dicebear/core'
import { initials } from '@dicebear/collection'
import styles from './styles.module.scss'

interface UserAvatarProps {
  size?: number
  className?: string
  style?: React.CSSProperties
}

const UserAvatar: React.FC<UserAvatarProps> = ({ 
  size = 32, 
  className = '', 
  style = {} 
}) => {
  const { data: session } = useSession()
  const [userImageUrl, setUserImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [generatedAvatar, setGeneratedAvatar] = useState<string>('')

  // Fetch user image from API
  useEffect(() => {
    const fetchUserImage = async () => {
      if (!session?.user?.id) {
        setIsLoading(false)
        return
      }
      
      try {
        const response = await fetch('/api/user')
        if (response.ok) {
          const userData = await response.json()
          setUserImageUrl(userData.image_preview || userData.image_cropped || null)
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserImage()
  }, [session])

  // Generate avatar based on user ID
  useEffect(() => {
    const generateAvatar = async () => {
      if (session?.user?.id && !userImageUrl && !isLoading) {
        try {
          const avatar = createAvatar(initials, {
            seed: session.user.id,
            size: size,
            backgroundColor: ['b6e3f4', '818cf8', 'fbbf24', 'f87171', '34d399', 'a78bfa'],
            backgroundType: ['solid'],
            fontFamily: ['Arial'],
            fontWeight: [600],
            textColor: ['ffffff'],
          })
          
          const dataUri = await avatar.toDataUri()
          setGeneratedAvatar(dataUri)
        } catch (error) {
          console.error('Error generating avatar:', error)
        }
      }
    }

    generateAvatar()
  }, [session?.user?.id, userImageUrl, isLoading, size])

  const avatarStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    objectFit: 'cover',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...style
  }

  const avatarClassName = `${styles.userAvatar} ${className}`

  if (isLoading) {
    return (
      <div 
        className={`${avatarClassName} ${styles.loading}`}
        style={{
          ...avatarStyle,
          backgroundColor: '#f0f0f0'
        }}
      />
    )
  }

  if (userImageUrl) {
    return (
      <img
        src={userImageUrl}
        alt="User Avatar"
        className={avatarClassName}
        style={avatarStyle}
        onError={() => setUserImageUrl(null)} // Fallback to generated avatar if image fails to load
      />
    )
  }

  if (generatedAvatar) {
    return (
      <img
        src={generatedAvatar}
        alt="Generated Avatar"
        className={avatarClassName}
        style={avatarStyle}
      />
    )
  }

  // Final fallback - simple colored circle with initials
  const initials = session?.user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 
                   session?.user?.email?.[0]?.toUpperCase() || 'U'
  
  return (
    <div 
      className={avatarClassName}
      style={{
        ...avatarStyle,
        backgroundColor: '#1890ff',
        color: 'white',
        fontSize: size * 0.4,
        fontWeight: 600
      }}
    >
      {initials}
    </div>
  )
}

export default UserAvatar