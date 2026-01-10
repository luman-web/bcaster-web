import React, { useState, useRef, useEffect } from 'react'
import { Button, Badge } from 'antd'
// components
import Chat from '../../../Chat'
// icons
import { WechatOutlined } from '@ant-design/icons'
// styles
import style from './style.module.scss'

const Navigation: React.FC = () => {
  const messagesCount = 0
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLDivElement>(null)

  const handleChatClick = () => {
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
    <div className={style.chatDropdown}>
      <div ref={buttonRef}>
        <Badge 
          count={messagesCount}
          overflowCount={99}
          offset={[-11, 13]}
          size="small"
          className={style.chatDropdown__messagesCount}
        >
          <Button
            size="small"
            type="text"
            className={style.chatDropdown__trigger}
            onClick={handleChatClick}
          >
            <WechatOutlined className={style.chatDropdown__triggerIcon} />
          </Button>
        </Badge>
      </div>
      
      {isDropdownOpen && (
        <div 
          ref={dropdownRef}
          className={style.chatDropdown__content}
        >
          <Chat />
        </div>
      )}
    </div>
  )
}

export default Navigation