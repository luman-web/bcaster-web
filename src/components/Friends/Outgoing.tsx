'use client';

import React, { useEffect, useState } from 'react';
import { Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { useFriendCounts } from '@/contexts/FriendCountsContext';
import UserItem from '@/components/Friends/UserItem';
import styles from './friends-list.module.scss';

interface User {
  id: string;
  name: string | null;
  email: string;
  image_preview?: string | null;
}

const OutgoingPage: React.FC = () => {
  const [outgoing, setOutgoing] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingOn, setActingOn] = useState<string | null>(null);
  const { refetchCounts } = useFriendCounts();

  useEffect(() => {
    fetchOutgoing();
  }, []);

  const fetchOutgoing = async () => {
    try {
      const response = await fetch('/api/friends?type=outgoing');
      if (response.ok) {
        const data = await response.json();
        setOutgoing(data);
      }
    } catch (error) {
      console.error('Failed to fetch outgoing requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (userId: string) => {
    setActingOn(userId);
    try {
      const response = await fetch('/api/friends/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });

      if (response.ok) {
        setOutgoing(outgoing.filter(o => o.id !== userId));
        await refetchCounts();
      }
    } catch (error) {
      console.error('Failed to cancel request:', error);
    } finally {
      setActingOn(null);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  if (outgoing.length === 0) {
    return <div className={styles.empty}>Нет исходящих запросов в друзья</div>;
  }

  return (
    <div className={styles.list}>
      {outgoing.map(user => (
        <UserItem
          key={user.id}
          user={user}
          actions={
            <Button
              size="small"
              icon={<CloseOutlined />}
              onClick={() => handleCancel(user.id)}
              disabled={actingOn === user.id}
              loading={actingOn === user.id}
            >
              Отменить
            </Button>
          }
        />
      ))}
    </div>
  );
};

export default OutgoingPage;
