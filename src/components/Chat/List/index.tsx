import React from 'react'
import { Tabs, List, Badge } from 'antd'
import {
  MessageOutlined,
  TeamOutlined,
  CalendarOutlined,
} from '@ant-design/icons'
// store
import useChatStore from '../chat-store'
// types
import { ChatTab } from '../state'
// components
import DirectChatItem from './DirectChatItem'
import GroupChatItem from './GroupChatItem'
import EventChatItem from './EventChatItem'
// styles
import styles from './style.module.scss'

// types
import { DirectChatItemProps } from './DirectChatItem'
import { GroupChatItemProps } from './GroupChatItem'
import { EventChatItemProps } from './EventChatItem'

// Hardcoded data for demonstration
let directChats: DirectChatItemProps[] = []
let groupChats: GroupChatItemProps[] = []
let eventChats: EventChatItemProps[] = []

const ChatList: React.FC = () => {
  const { setDetail, activeTab, setActiveTab } = useChatStore()

  const handleChatClick = (chatId: string) => {
    setDetail(chatId)
  }

  const handleTabChange = (key: string) => {
    setActiveTab(key as ChatTab)
  }

  const tabItems = [
    {
      key: 'direct',
      label: (
        <span className={styles.tabLabel}>
          <MessageOutlined className={styles.tabLabelIcon} />
          Контакты
          <Badge count={directChats.reduce((sum, chat) => sum + chat.unreadCount, 0)} size="small" />
        </span>
      ),
      children: (
        <List
          className={styles.listContainer}
          dataSource={directChats}
          renderItem={(item) => {
            return directChats.length ? (
              <DirectChatItem
                key={item.id}
                id={item.id}
                name={item.name}
                avatar={item.avatar}
                lastMessage={item.lastMessage}
                timestamp={item.timestamp}
                unreadCount={item.unreadCount}
                isOnline={item.isOnline}
                onClick={handleChatClick}
              />
            ) : null
          }}
        />
      ),
    },
    {
      key: 'group',
      label: (
        <span className={styles.tabLabel}>
          <TeamOutlined className={styles.tabLabelIcon} />
          Группы
          <Badge
            count={groupChats.reduce((sum, chat) => sum + chat.unreadCount, 0)}
            size="small"
          />
        </span>
      ),
      children: (
        <List
          className={styles.listContainer}
          dataSource={groupChats}
          renderItem={(item) => (
            <GroupChatItem
              key={item.id}
              id={item.id}
              name={item.name}
              avatar={item.avatar}
              lastMessage={item.lastMessage}
              timestamp={item.timestamp}
              unreadCount={item.unreadCount}
              memberCount={item.memberCount}
              onClick={handleChatClick}
            />
          )}
        />
      ),
    },
    {
      key: 'events',
      label: (
        <span className={styles.tabLabel}>
          <CalendarOutlined className={styles.tabLabelIcon} />
          События
          <Badge
            count={eventChats.reduce((sum, chat) => sum + chat.unreadCount, 0)}
            size="small"
          />
        </span>
      ),
      children: (
        <List
          className={styles.listContainer}
          dataSource={eventChats}
          renderItem={(item) => (
            <EventChatItem
              key={item.id}
              id={item.id}
              name={item.name}
              avatar={item.avatar}
              lastMessage={item.lastMessage}
              timestamp={item.timestamp}
              unreadCount={item.unreadCount}
              date={item.date}
              attendeeCount={item.attendeeCount}
            />
          )}
        />
      ),
    },
  ]

  return (
    <div className={styles.chatList}>
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        items={tabItems}
        size="small"
      />
    </div>
  )
}

export default ChatList
