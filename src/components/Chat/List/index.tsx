import React from 'react'
import { Tabs, List, Badge } from 'antd';
import { MessageOutlined, TeamOutlined, CalendarOutlined } from '@ant-design/icons';
// store
import useChatStore from '../chat-store'
// types
import { ChatTab } from '../state'
// components
import DirectChatItem from './DirectChatItem';
import GroupChatItem from './GroupChatItem';
import EventChatItem from './EventChatItem';
// styles
import styles from './style.module.scss';

// Hardcoded data for demonstration
const directChats = [
  {
    id: 'direct-1',
    name: 'John Doe',
    avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=john',
    lastMessage: 'Hey, how are you doing?',
    timestamp: '2m ago',
    unreadCount: 2,
    isOnline: true,
  },
  {
    id: 'direct-2',
    name: 'Sarah Wilson',
    avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=sarah',
    lastMessage: 'Thanks for the help yesterday!',
    timestamp: '15m ago',
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: 'direct-3',
    name: 'Mike Johnson',
    avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=mike',
    lastMessage: 'See you at the meeting',
    timestamp: '1h ago',
    unreadCount: 1,
    isOnline: true,
  },
  {
    id: 'direct-1',
    name: 'John Doe',
    avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=john',
    lastMessage: 'Hey, how are you doing?',
    timestamp: '2m ago',
    unreadCount: 2,
    isOnline: true,
  },
  {
    id: 'direct-2',
    name: 'Sarah Wilson',
    avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=sarah',
    lastMessage: 'Thanks for the help yesterday!',
    timestamp: '15m ago',
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: 'direct-3',
    name: 'Mike Johnson',
    avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=mike',
    lastMessage: 'See you at the meeting',
    timestamp: '1h ago',
    unreadCount: 1,
    isOnline: true,
  },
  {
    id: 'direct-1',
    name: 'John Doe',
    avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=john',
    lastMessage: 'Hey, how are you doing?',
    timestamp: '2m ago',
    unreadCount: 2,
    isOnline: true,
  },
  {
    id: 'direct-2',
    name: 'Sarah Wilson',
    avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=sarah',
    lastMessage: 'Thanks for the help yesterday!',
    timestamp: '15m ago',
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: 'direct-3',
    name: 'Mike Johnson',
    avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=mike',
    lastMessage: 'See you at the meeting',
    timestamp: '1h ago',
    unreadCount: 1,
    isOnline: true,
  },
  {
    id: 'direct-1',
    name: 'John Doe',
    avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=john',
    lastMessage: 'Hey, how are you doing?',
    timestamp: '2m ago',
    unreadCount: 2,
    isOnline: true,
  },
  {
    id: 'direct-2',
    name: 'Sarah Wilson',
    avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=sarah',
    lastMessage: 'Thanks for the help yesterday!',
    timestamp: '15m ago',
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: 'direct-3',
    name: 'Mike Johnson',
    avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=mike',
    lastMessage: 'See you at the meeting',
    timestamp: '1h ago',
    unreadCount: 1,
    isOnline: true,
  },
  {
    id: 'direct-1',
    name: 'John Doe',
    avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=john',
    lastMessage: 'Hey, how are you doing?',
    timestamp: '2m ago',
    unreadCount: 2,
    isOnline: true,
  },
  {
    id: 'direct-2',
    name: 'Sarah Wilson',
    avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=sarah',
    lastMessage: 'Thanks for the help yesterday!',
    timestamp: '15m ago',
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: 'direct-3',
    name: 'Mike Johnson',
    avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=mike',
    lastMessage: 'See you at the meeting',
    timestamp: '1h ago',
    unreadCount: 1,
    isOnline: true,
  },
  {
    id: 'direct-1',
    name: 'John Doe',
    avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=john',
    lastMessage: 'Hey, how are you doing?',
    timestamp: '2m ago',
    unreadCount: 2,
    isOnline: true,
  },
  {
    id: 'direct-2',
    name: 'Sarah Wilson',
    avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=sarah',
    lastMessage: 'Thanks for the help yesterday!',
    timestamp: '15m ago',
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: 'direct-3',
    name: 'Mike Johnson',
    avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=mike',
    lastMessage: 'See you at the meeting',
    timestamp: '1h ago',
    unreadCount: 1,
    isOnline: true,
  },
];

const groupChats = [
  {
    id: 'group-1',
    name: 'Development Team',
    avatar: undefined,
    lastMessage: 'Alice: New feature is ready for review',
    timestamp: '5m ago',
    unreadCount: 3,
    memberCount: 8,
  },
  {
    id: 'group-2',
    name: 'Project Alpha',
    avatar: undefined,
    lastMessage: 'Bob: Meeting scheduled for tomorrow',
    timestamp: '30m ago',
    unreadCount: 0,
    memberCount: 12,
  },
  {
    id: 'group-3',
    name: 'Marketing Team',
    avatar: undefined,
    lastMessage: 'Carol: Campaign results are in!',
    timestamp: '2h ago',
    unreadCount: 5,
    memberCount: 6,
  },
];

const eventChats = [
  {
    id: 'event-1',
    name: 'Team Building Event',
    avatar: undefined,
    lastMessage: 'Reminder: Event starts at 2 PM',
    timestamp: '10m ago',
    unreadCount: 1,
    date: 'Dec 5, 2025',
    attendeeCount: 25,
  },
  {
    id: 'event-2',
    name: 'Product Launch',
    avatar: undefined,
    lastMessage: 'Final preparations underway',
    timestamp: '1h ago',
    unreadCount: 0,
    date: 'Dec 15, 2025',
    attendeeCount: 50,
  },
  {
    id: 'event-3',
    name: 'Quarterly Review',
    avatar: undefined,
    lastMessage: 'Please prepare your reports',
    timestamp: '3h ago',
    unreadCount: 2,
    date: 'Dec 20, 2025',
    attendeeCount: 15,
  },
];

const ChatList: React.FC = () => {
  const { setDetail, activeTab, setActiveTab } = useChatStore()

  const handleChatClick = (chatId: string) => {
    setDetail(chatId);
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key as ChatTab);
  };

  const tabItems = [
    {
      key: 'direct',
      label: (
        <span className={styles.tabLabel}>
          <MessageOutlined className={styles.tabLabelIcon} />
          Контакты
          <Badge 
            count={directChats.reduce((sum, chat) => sum + chat.unreadCount, 0)} 
            size="small" 
          />
        </span>
      ),
      children: (
        <List
          className={styles.listContainer}
          dataSource={directChats}
          renderItem={(item) => (
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
          )}
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
  ];

  return (
    <div className={styles.chatList}>
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        items={tabItems}
        size="small"
      />
    </div>
  );
};

export default ChatList;
