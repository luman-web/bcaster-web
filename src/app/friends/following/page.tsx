'use client';

import React, { useEffect, useState } from 'react';
import { Button } from 'antd';
import UserItem from '@/components/Friends/UserItem';
import styles from '@/components/Friends/friends-list.module.scss';

interface User {
  id: string;
  name: string | null;
  email: string;
  image_preview?: string | null;
}

const FollowingPage: React.FC = () => {
  const [following, setFollowing] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingOn, setActingOn] = useState<string | null>(null);

  useEffect(() => {
    fetchFollowing();
  }, []);

  const fetchFollowing = async () => {
    try {
      const response = await fetch('/api/friends?type=following');
      if (response.ok) {
        const data = await response.json();
        setFollowing(data);
      }
    } catch (error) {
      console.error('Failed to fetch following:', error);
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
        setFollowing(following.filter(f => f.id !== userId));
      }
    } catch (error) {
      console.error('Failed to add friend:', error);
    } finally {
      setActingOn(null);
    }
  };

  const handleUnfollow = async (userId: string) => {
    setActingOn(userId);
    try {
      // Delete the following edge
      const response = await fetch('/api/friends/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });

      if (response.ok) {
        setFollowing(following.filter(f => f.id !== userId));
      }
    } catch (error) {
      console.error('Failed to unfollow:', error);
    } finally {
      setActingOn(null);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  if (following.length === 0) {
    return <div className={styles.empty}>Вы никого не подписаны</div>;
  }

  return (
    <div className={styles.list}>
      {following.map(user => (
        <UserItem
          key={user.id}
          user={user}
          actions={
            <div className={styles.actionGroup}>
              <Button
                type="primary"
                size="small"
                onClick={() => handleAddFriend(user.id)}
                disabled={actingOn === user.id}
                loading={actingOn === user.id}
              >
                В друзья
              </Button>
              <Button
                danger
                size="small"
                onClick={() => handleUnfollow(user.id)}
                disabled={actingOn === user.id}
                loading={actingOn === user.id}
              >
                Отписаться
              </Button>
            </div>
          }
        />
      ))}
    </div>
  );
};

export default FollowingPage;
