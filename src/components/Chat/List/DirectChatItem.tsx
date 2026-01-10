import React from 'react'
import { List, Avatar, Badge, Typography } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import styles from './style.module.scss'

const { Text } = Typography

export interface DirectChatItemProps {
  id: string
  name: string
  avatar?: string
  lastMessage: string
  timestamp: string
  unreadCount: number
  isOnline: boolean
  onClick: (chatId: string) => void
}

const DirectChatItem: React.FC<DirectChatItemProps> = ({
  id,
  name,
  avatar,
  lastMessage,
  timestamp,
  unreadCount,
  isOnline,
  onClick,
}) => {
  return (
    <List.Item className={styles.chatItem} onClick={() => onClick(id)}>
      <List.Item.Meta
        avatar={
          <Badge
            dot={isOnline}
            status={isOnline ? 'success' : 'default'}
            offset={[-8, 35]}
          >
            <Avatar
              src={avatar}
              icon={<UserOutlined />}
              size={48}
              className={styles.avatar}
            />
          </Badge>
        }
        title={
          <div className={styles.chatMeta}>
            <Text className={styles.chatTitle}>{name}</Text>
            <div className={styles.chatActions}>
              <Text className={styles.chatTimestamp}>{timestamp}</Text>
              {unreadCount > 0 && (
                <Badge
                  count={unreadCount}
                  size="small"
                  style={{ backgroundColor: '#1890ff' }}
                />
              )}
            </div>
          </div>
        }
        description={<Text className={styles.chatMessage}>{lastMessage}</Text>}
      />
    </List.Item>
  )
}

export default DirectChatItem
