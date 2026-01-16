'use client';

import React, { useEffect, useState } from 'react';
import { Button } from 'antd';
import { CheckOutlined, LockOutlined } from '@ant-design/icons';
import { useFriendCounts } from '@/contexts/FriendCountsContext';
import UserItem from '@/components/Friends/UserItem';
import styles from './friends-list.module.scss';

interface User {
  id: string;
  name: string | null;
  email: string;
  image_preview?: string | null;
}

const FollowersPage: React.FC = () => {
  const [followers, setFollowers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingOn, setActingOn] = useState<string | null>(null);
  const { refetchCounts } = useFriendCounts();

  useEffect(() => {
    fetchFollowers();
  }, []);

  const fetchFollowers = async () => {
    try {
      const response = await fetch('/api/friends?type=followers');
      if (response.ok) {
        const data = await response.json();
        setFollowers(data);
      }
    } catch (error) {
      console.error('Не удалось получить список подписчиков:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (userId: string) => {
    setActingOn(userId);
    try {
      const response = await fetch('/api/user/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiver_id: userId }),
      });

      if (response.ok) {
        setFollowers(followers.filter(f => f.id !== userId));
        await refetchCounts();
      }
    } catch (error) {
      console.error('Не удалось отправить запрос:', error);
    } finally {
      setActingOn(null);
    }
  };

  const handleBlock = async (userId: string) => {
    setActingOn(userId);
    try {
      const response = await fetch('/api/friends/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });

      if (response.ok) {
        setFollowers(followers.filter(f => f.id !== userId));
        await refetchCounts();
      }
    } catch (error) {
      console.error('Не удалось заблокировать пользователя:', error);
    } finally {
      setActingOn(null);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  if (followers.length === 0) {
    return <div className={styles.empty}>Список подписчиков пустой</div>;
  }

  return (
    <div className={styles.list}>
      {followers.map(follower => (
        <UserItem
          key={follower.id}
          user={follower}
          actions={
            <div className={styles.actionGroup}>
              <Button
                type="primary"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleAddFriend(follower.id)}
                disabled={actingOn === follower.id}
                loading={actingOn === follower.id}
              >
                В друзья
              </Button>
              <Button
                danger
                size="small"
                icon={<LockOutlined />}
                onClick={() => handleBlock(follower.id)}
                disabled={actingOn === follower.id}
                loading={actingOn === follower.id}
              >
                Заблокировать
              </Button>
            </div>
          }
        />
      ))}
    </div>
  );
};

export default FollowersPage;
