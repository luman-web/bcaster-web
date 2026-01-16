'use client';

import React, { useEffect, useState } from 'react';
import { Button } from 'antd';
import { UnlockOutlined } from '@ant-design/icons';
import { useFriendCounts } from '@/contexts/FriendCountsContext';
import UserItem from '@/components/Friends/UserItem';
import styles from './friends-list.module.scss';

interface User {
  id: string;
  name: string | null;
  email: string;
  image_preview?: string | null;
}

const BlockedUsers: React.FC = () => {
  const [blocked, setBlocked] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingOn, setActingOn] = useState<string | null>(null);
  const { refetchCounts } = useFriendCounts();

  useEffect(() => {
    fetchBlocked();
  }, []);

  const fetchBlocked = async () => {
    try {
      const response = await fetch('/api/friends?type=blocked');
      if (response.ok) {
        const data = await response.json();
        setBlocked(data);
      }
    } catch (error) {
      console.error('Не удалось получить список заблокированных пользователей:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (userId: string) => {
    setActingOn(userId);
    try {
      const response = await fetch('/api/friends/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });

      if (response.ok) {
        setBlocked(blocked.filter(b => b.id !== userId));
        await refetchCounts();
      }
    } catch (error) {
      console.error('Не удалось разблокировать:', error);
    } finally {
      setActingOn(null);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading blocked users...</div>;
  }

  if (blocked.length === 0) {
    return <div className={styles.empty}>No blocked users</div>;
  }

  return (
    <div className={styles.list}>
      {blocked.map(user => (
        <UserItem
          key={user.id}
          user={user}
          actions={
            <Button
              type="primary"
              size="small"
              icon={<UnlockOutlined />}
              onClick={() => handleUnblock(user.id)}
              disabled={actingOn === user.id}
              loading={actingOn === user.id}
            >
              Разблокировать
            </Button>
          }
        />
      ))}
    </div>
  );
};

export default BlockedUsers;
