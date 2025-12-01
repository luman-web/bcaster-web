import React from 'react';
import { Card, Avatar, Button, Input, List, Typography, Space, Divider } from 'antd';
import { UserOutlined, SendOutlined, PhoneOutlined, VideoCameraOutlined, MoreOutlined } from '@ant-design/icons';
import useChatStore from '../chat-store';
import styles from './style.module.scss';

const { Text, Title } = Typography;
const { TextArea } = Input;

interface DirectChatDetailProps {
  chatId: string;
}

// Mock direct chat data
const getDirectChatData = (chatId: string) => {
  const chats: { [key: string]: any } = {
    'direct-1': {
      id: 'direct-1',
      name: 'John Doe',
      avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=john',
      isOnline: true,
      lastSeen: 'Online',
    },
    'direct-2': {
      id: 'direct-2',
      name: 'Sarah Wilson',
      avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=sarah',
      isOnline: false,
      lastSeen: 'Last seen 5 minutes ago',
    },
    'direct-3': {
      id: 'direct-3',
      name: 'Mike Johnson',
      avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=mike',
      isOnline: true,
      lastSeen: 'Online',
    },
  };
  return chats[chatId] || null;
};

// Mock messages
const mockMessages = [
  { id: 1, sender: 'John Doe', message: 'Hey, how are you doing?', time: '2:30 PM', isOwn: false },
  { id: 2, sender: 'You', message: 'Hi John! I\'m doing great, thanks for asking', time: '2:32 PM', isOwn: true },
  { id: 3, sender: 'John Doe', message: 'That\'s awesome! Are we still on for the meeting tomorrow?', time: '2:35 PM', isOwn: false },
  { id: 4, sender: 'You', message: 'Yes, absolutely! See you at 10 AM', time: '2:36 PM', isOwn: true },
  { id: 1, sender: 'John Doe', message: 'Hey, how are you doing?', time: '2:30 PM', isOwn: false },
  { id: 2, sender: 'You', message: 'Hi John! I\'m doing great, thanks for asking', time: '2:32 PM', isOwn: true },
  { id: 3, sender: 'John Doe', message: 'That\'s awesome! Are we still on for the meeting tomorrow?', time: '2:35 PM', isOwn: false },
  { id: 4, sender: 'You', message: 'Yes, absolutely! See you at 10 AM', time: '2:36 PM', isOwn: true },
  { id: 1, sender: 'John Doe', message: 'Hey, how are you doing?', time: '2:30 PM', isOwn: false },
  { id: 2, sender: 'You', message: 'Hi John! I\'m doing great, thanks for asking', time: '2:32 PM', isOwn: true },
  { id: 3, sender: 'John Doe', message: 'That\'s awesome! Are we still on for the meeting tomorrow?', time: '2:35 PM', isOwn: false },
  { id: 4, sender: 'You', message: 'Yes, absolutely! See you at 10 AM', time: '2:36 PM', isOwn: true },
  { id: 1, sender: 'John Doe', message: 'Hey, how are you doing?', time: '2:30 PM', isOwn: false },
  { id: 2, sender: 'You', message: 'Hi John! I\'m doing great, thanks for asking', time: '2:32 PM', isOwn: true },
  { id: 3, sender: 'John Doe', message: 'That\'s awesome! Are we still on for the meeting tomorrow?', time: '2:35 PM', isOwn: false },
  { id: 4, sender: 'You', message: 'Yes, absolutely! See you at 10 AM', time: '2:36 PM', isOwn: true },
  { id: 1, sender: 'John Doe', message: 'Hey, how are you doing?', time: '2:30 PM', isOwn: false },
  { id: 2, sender: 'You', message: 'Hi John! I\'m doing great, thanks for asking', time: '2:32 PM', isOwn: true },
  { id: 3, sender: 'John Doe', message: 'That\'s awesome! Are we still on for the meeting tomorrow?', time: '2:35 PM', isOwn: false },
  { id: 4, sender: 'You', message: 'Yes, absolutely! See you at 10 AM', time: '2:36 PM', isOwn: true },
];

const DirectChatDetail: React.FC<DirectChatDetailProps> = ({ chatId }) => {
  const { setDetail } = useChatStore();
  const chatData = getDirectChatData(chatId);

  if (!chatData) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Text>Chat not found</Text>
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
            <Avatar src={chatData.avatar} icon={<UserOutlined />} size={44} />
            <div className={styles.headerInfo}>
              <Title level={5} className={styles.chatTitle}>
                {chatData.name}
              </Title>
              <Text type="secondary" className={styles.chatSubtitle}>
                {chatData.lastSeen}
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
        {mockMessages.map((msg) => (
          <div
            key={msg.id}
            className={`${styles.messageContainer} ${msg.isOwn ? styles['messageContainer--own'] : styles['messageContainer--received']}`}
          >
            <div
              className={`${styles.messageBubble} ${msg.isOwn ? styles['messageBubble--own'] : styles['messageBubble--received']}`}
            >
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

export default DirectChatDetail;