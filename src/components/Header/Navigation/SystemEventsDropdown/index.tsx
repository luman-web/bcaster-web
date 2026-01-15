import React, { useState, useRef, useEffect } from 'react'
import { Button, Badge } from 'antd'
import { useSession } from 'next-auth/react'
import { useWebSocket } from '@/lib/useWebSocket'
// components
import SystemEventsList from '@/components/SystemEventsList'
// icons
import { BellOutlined } from '@ant-design/icons'
// styles
import style from './style.module.scss'

const Navigation: React.FC = () => {
  const [systemEventsCount, setSystemEventsCount] = useState(0)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLDivElement>(null)
  const { data: session } = useSession()
  const userId = session?.user.id
  const { onMessage } = useWebSocket()
  const hasMarkedAsReadRef = useRef(false)

  // Fetch system events count
  const fetchEventsCount = async () => {
    try {
      const response = await fetch('/api/system-events')
      if (response.ok) {
        const data = await response.json()
        setSystemEventsCount(data.unread_count)
      }
    } catch (error) {
      console.error('Error fetching system events count:', error)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchEventsCount()
  }, [])

  // Listen for WebSocket messages about new events
  useEffect(() => {
    const unsubscribe = onMessage((data) => {
      if (data.type === `user_event.${userId}` || data.eventType === `user_event.${userId}`) {
        // Increment count and play sound/notification
        setSystemEventsCount(prev => prev + 1)
      }
    })

    return unsubscribe
  }, [onMessage])

  const handleSystemEventsClick = () => {
    const newOpenState = !isDropdownOpen
    setIsDropdownOpen(newOpenState)
    
    if (newOpenState) {
      // Reset the flag when opening so we can mark as read
      hasMarkedAsReadRef.current = false
    }
  }

  const handleOnDropdownOpen = () => {
    if (!hasMarkedAsReadRef.current) {
      hasMarkedAsReadRef.current = true
      // Mark as read will happen in SystemEventsList
    }
    // Refresh count when event is removed or marked as read
    fetchEventsCount()
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
      setIsDropdownOpen(false)
      // Refresh count when dropdown closes
      fetchEventsCount()
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

  return (
    <div className={style.systemEventsDropdown}>
      <div ref={buttonRef}>
        <Badge 
          count={systemEventsCount}
          overflowCount={99}
          offset={[-11, 13]}
          size="small"
          className={style.systemEventsDropdown__systemEventsCount}
        >
          <Button
            size="small"
            type="text"
            className={style.systemEventsDropdown__trigger}
            onClick={handleSystemEventsClick}
          >
            <BellOutlined className={style.systemEventsDropdown__triggerIcon} />
          </Button>
        </Badge>
      </div>
      
      {isDropdownOpen && (
        <div 
          ref={dropdownRef}
          className={style.systemEventsDropdown__content}
        >
          <SystemEventsList onOpen={handleOnDropdownOpen} />
        </div>
      )}
    </div>
  )
}

export default Navigation