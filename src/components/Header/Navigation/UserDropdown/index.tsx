import React, { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { createAvatar } from '@dicebear/core'
import { Button } from 'antd'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { initials } from '@dicebear/collection'
// styles
import style from './style.module.scss'
// types
import type { MenuProps } from 'antd'

const UserAvatar: React.FC = () => {
  const size = 32
  const { data: session } = useSession()
  const [userImageUrl, setUserImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [generatedAvatar, setGeneratedAvatar] = useState<string>('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLDivElement>(null)

  const handleUserClick = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
      setIsDropdownOpen(false)
    }
  }

  useEffect(() => {
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])
  
  const items: MenuProps['items'] = [
    {
      label: <Link href="/profile">Профиль</Link>,
      key: '0',
    },
    {
      label: <a onClick={() => signOut({ redirectTo: '/' })}>Выход</a>,
      key: '1',
    },
  ]

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
            fontWeight: 600,
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
    marginLeft: '-4px',
  }

  const renderDropdown = () => (
    isDropdownOpen && (
      <div 
        ref={dropdownRef}
        className={style.userDropdown__content}
      >
        <div className={style.userDropdown__menu}>
          {items?.map((item) => {
            if (!item || 'type' in item) return null; // Skip dividers and invalid items
            const menuItem = item as { key: React.Key; label: React.ReactNode; };
            return (
              <div 
                key={menuItem.key} 
                className={style.userDropdown__menuItem}
                onClick={() => setIsDropdownOpen(false)}
              >
                {menuItem.label}
              </div>
            );
          })}
        </div>
      </div>
    )
  )

  const renderAvatarContent = () => {
    if (isLoading) {
      return (
        <div 
          className={style.loading}
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
          style={avatarStyle}
        />
      )
    }

    // Final fallback - simple colored circle with initials
    const initials = session?.user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 
                     session?.user?.email?.[0]?.toUpperCase() || 'U'
    
    return (
      <div 
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

  if (isLoading) {
    <div className={style.userDropdown}>
      <div ref={buttonRef}>
        <Button
          size="small"
          type="text"
          className={style.userDropdown__trigger}
        >
          {renderAvatarContent()}
        </Button>
      </div>
    </div>
  }

  return (
    <div className={style.userDropdown}>
      <div ref={buttonRef}>
        <Button
          size="small"
          type="text"
          className={style.userDropdown__trigger}
          onClick={handleUserClick}
        >
          {renderAvatarContent()}
        </Button>
      </div>
      
      {renderDropdown()}
    </div>
  )
}

export default UserAvatar