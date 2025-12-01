import React from 'react';
import { Card, Avatar, Button, Input, List, Typography, Space, Badge, Divider } from 'antd';
import { TeamOutlined, SendOutlined, PhoneOutlined, VideoCameraOutlined, MoreOutlined, UserOutlined } from '@ant-design/icons';
import useChatStore from '../chat-store';
import styles from './style.module.scss';

const { Text, Title } = Typography;
const { TextArea } = Input;

interface GroupChatDetailProps {
  chatId: string;
}

// Mock group chat data
const getGroupChatData = (chatId: string) => {
  const chats: { [key: string]: any } = {
    'group-1': {
      id: 'group-1',
      name: 'Development Team',
      memberCount: 8,
      avatar: null,
      members: [
        { name: 'Alice Smith', avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=alice', isOnline: true },
        { name: 'Bob Johnson', avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=bob', isOnline: false },
        { name: 'Carol Davis', avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=carol', isOnline: true },
        { name: 'David Wilson', avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=david', isOnline: true },
      ],
    },
    'group-2': {
      id: 'group-2',
      name: 'Project Alpha',
      memberCount: 12,
      avatar: null,
      members: [
        { name: 'Emma Brown', avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=emma', isOnline: true },
        { name: 'Frank Miller', avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=frank', isOnline: false },
        { name: 'Grace Taylor', avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=grace', isOnline: true },
      ],
    },
    'group-3': {
      id: 'group-3',
      name: 'Marketing Team',
      memberCount: 6,
      avatar: null,
      members: [
        { name: 'Henry Clark', avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=henry', isOnline: false },
        { name: 'Ivy Lewis', avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=ivy', isOnline: true },
      ],
    },
  };
  return chats[chatId] || null;
};

// Mock group messages
const mockGroupMessages = [
  { id: 1, sender: 'Alice Smith', message: 'New feature is ready for review', time: '1:15 PM', isOwn: false, avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=alice' },
  { id: 2, sender: 'You', message: 'Great work Alice! I\'ll review it this afternoon', time: '1:18 PM', isOwn: true },
  { id: 3, sender: 'Bob Johnson', message: 'Should we schedule a demo for tomorrow?', time: '1:25 PM', isOwn: false, avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=bob' },
  { id: 4, sender: 'Carol Davis', message: 'Tomorrow works for me! What time?', time: '1:27 PM', isOwn: false, avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=carol' },
  { id: 5, sender: 'You', message: 'How about 2 PM in the main conference room?', time: '1:30 PM', isOwn: true },
  { id: 1, sender: 'Alice Smith', message: 'New feature is ready for review', time: '1:15 PM', isOwn: false, avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=alice' },
  { id: 2, sender: 'You', message: 'Great work Alice! I\'ll review it this afternoon', time: '1:18 PM', isOwn: true },
  { id: 3, sender: 'Bob Johnson', message: 'Should we schedule a demo for tomorrow?', time: '1:25 PM', isOwn: false, avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=bob' },
  { id: 4, sender: 'Carol Davis', message: 'Tomorrow works for me! What time?', time: '1:27 PM', isOwn: false, avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=carol' },
  { id: 5, sender: 'You', message: 'How about 2 PM in the main conference room?', time: '1:30 PM', isOwn: true },
  { id: 1, sender: 'Alice Smith', message: 'New feature is ready for review', time: '1:15 PM', isOwn: false, avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=alice' },
  { id: 2, sender: 'You', message: 'Great work Alice! I\'ll review it this afternoon', time: '1:18 PM', isOwn: true },
  { id: 3, sender: 'Bob Johnson', message: 'Should we schedule a demo for tomorrow?', time: '1:25 PM', isOwn: false, avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=bob' },
  { id: 4, sender: 'Carol Davis', message: 'Tomorrow works for me! What time?', time: '1:27 PM', isOwn: false, avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=carol' },
  { id: 5, sender: 'You', message: 'How about 2 PM in the main conference room?', time: '1:30 PM', isOwn: true },
  { id: 1, sender: 'Alice Smith', message: 'New feature is ready for review', time: '1:15 PM', isOwn: false, avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=alice' },
  { id: 2, sender: 'You', message: 'Great work Alice! I\'ll review it this afternoon', time: '1:18 PM', isOwn: true },
  { id: 3, sender: 'Bob Johnson', message: 'Should we schedule a demo for tomorrow?', time: '1:25 PM', isOwn: false, avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=bob' },
  { id: 4, sender: 'Carol Davis', message: 'Tomorrow works for me! What time?', time: '1:27 PM', isOwn: false, avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=carol' },
  { id: 5, sender: 'You', message: 'How about 2 PM in the main conference room?', time: '1:30 PM', isOwn: true },
];

const GroupChatDetail: React.FC<GroupChatDetailProps> = ({ chatId }) => {
  const { setDetail } = useChatStore();
  const chatData = getGroupChatData(chatId);

  if (!chatData) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Text>Group chat not found</Text>
        <br />
        <Button onClick={() => setDetail(null)} style={{ marginTop: '16px' }}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.chatDetail}>
      {/* Chat Header */}
      <Card className={styles.chatHeader}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <Button type="text" onClick={() => setDetail(null)} className={styles.backButton}>
              ←
            </Button>
            <Avatar icon={<TeamOutlined />} size={44} />
            <div className={styles.headerInfo}>
              <Title level={5} className={styles.chatTitle}>
                {chatData.name}
              </Title>
              <Text type="secondary" className={styles.chatSubtitle}>
                {chatData.memberCount} members
              </Text>
            </div>
          </div>
          <Space size="middle" className={styles.headerActions}>
            <Button type="text" icon={<MoreOutlined />} />
          </Space>
        </div>
      </Card>

      {/* Messages Area */}
      <div className={styles.messagesArea}>
        {mockGroupMessages.map((msg) => (
          <div
            key={msg.id}
            className={`${styles.messageContainer} ${msg.isOwn ? styles['messageContainer--own'] : styles['messageContainer--received']}`}
          >
            {!msg.isOwn && (
              <Avatar src={msg.avatar} icon={<UserOutlined />} size={32} />
            )}
            <div
              className={`${styles.messageBubble} ${msg.isOwn ? styles['messageBubble--own'] : styles['messageBubble--received']}`}
            >
              {!msg.isOwn && (
                <Text strong className={styles.senderName}>
                  {msg.sender}
                </Text>
              )}
              <Text className={styles.messageText}>
                {msg.message}
              </Text>
              <div className={styles.messageTime}>
                {msg.time}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <Card className={styles.messageInput}>
        <div className={styles.inputContainer}>
          <TextArea
            placeholder="Type a message..."
            autoSize={{ minRows: 1, maxRows: 4 }}
            className={styles.textArea}
          />
          <Button type="primary" icon={<SendOutlined />} />
        </div>
      </Card>
    </div>
  );
};

export default GroupChatDetail;