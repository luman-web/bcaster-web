import React from 'react';
import Link from 'next/link';
import { List, Avatar, Badge, Typography } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import styles from './style.module.scss';

const { Text } = Typography;

interface EventChatItemProps {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  date: string;
  attendeeCount: number;
}

const EventChatItem: React.FC<EventChatItemProps> = ({
  id,
  name,
  avatar,
  lastMessage,
  timestamp,
  unreadCount,
  date,
  attendeeCount,
}) => {
  return (
    <Link href={`/events/${id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <List.Item
        className={styles.chatItem}
      >
      <List.Item.Meta
        avatar={
          <Avatar 
            src={avatar} 
            icon={<CalendarOutlined />}
            size={48}
            className={styles.avatar}
          />
        }
        title={
          <div className={styles.chatMeta}>
            <Text className={styles.chatTitle}>
              {name}
            </Text>
            <div className={styles.chatActions}>
              <Text className={styles.chatTimestamp}>
                {timestamp}
              </Text>
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
            <Text className={styles.chatMessage}>
              {lastMessage}
            </Text>
            <Text className={styles.chatDetails}>
              <CalendarOutlined /> {date} • {attendeeCount} attendees
            </Text>
          </div>
        }
      />
    </List.Item>
    </Link>
  );
};

export default EventChatItem;