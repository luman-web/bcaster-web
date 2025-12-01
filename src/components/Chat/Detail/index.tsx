import React from 'react'
import { Button, Typography } from 'antd';
// store
import useChatStore from '../chat-store'
// components
import DirectChatDetail from './DirectChatDetail'
import GroupChatDetail from './GroupChatDetail'
// styles
import styles from './style.module.scss'

const { Title, Text } = Typography;

const ChatDetail: React.FC = () => {
  const { detail, setDetail } = useChatStore()

  if (!detail) {
    return null
  }

  // Determine chat type based on ID prefix
  const getChatType = (chatId: string) => {
    if (chatId.startsWith('direct-')) return 'direct'
    if (chatId.startsWith('group-')) return 'group'
    if (chatId.startsWith('event-')) return 'event'
    return 'unknown'
  }

  const chatType = getChatType(detail)

  // Render appropriate component based on chat type
  switch (chatType) {
    case 'direct':
      return <DirectChatDetail chatId={detail} />
    case 'group':
      return <GroupChatDetail chatId={detail} />
  }
}

export default ChatDetail
