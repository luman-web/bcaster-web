import React, { useState, useRef, useEffect } from 'react'
import { Button, Badge } from 'antd'
// components
import SystemEventsList from '@/components/SystemEventsList'
// icons
import { BellOutlined } from '@ant-design/icons'
// styles
import style from './style.module.scss'

const Navigation: React.FC = () => {
  const systemEventsCount = 0
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLDivElement>(null)

  const handleSystemEventsClick = () => {
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
          <SystemEventsList />
        </div>
      )}
    </div>
  )
}

export default Navigation