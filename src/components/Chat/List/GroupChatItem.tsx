import React from 'react'
import { List, Avatar, Badge, Typography } from 'antd'
import { TeamOutlined } from '@ant-design/icons'
import styles from './style.module.scss'

const { Text } = Typography

export interface GroupChatItemProps {
  id: string
  name: string
  avatar?: string
  lastMessage: string
  timestamp: string
  unreadCount: number
  memberCount: number
  onClick: (chatId: string) => void
}

const GroupChatItem: React.FC<GroupChatItemProps> = ({
  id,
  name,
  avatar,
  lastMessage,
  timestamp,
  unreadCount,
  memberCount,
  onClick,
}) => {
  return (
    <List.Item className={styles.chatItem} onClick={() => onClick(id)}>
      <List.Item.Meta
        avatar={
          <Avatar
            src={avatar}
            icon={<TeamOutlined />}
            size={48}
            className={styles.avatar}
          />
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
        description={
          <div>
            <Text className={styles.chatMessage}>{lastMessage}</Text>
            <Text className={styles.chatDetails}>
              <TeamOutlined /> {memberCount} members
            </Text>
          </div>
        }
      />
    </List.Item>
  )
}

export default GroupChatItem
