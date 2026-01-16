'use client';

import React, { useEffect, useState } from 'react';
import { Button } from 'antd';
import { UserDeleteOutlined } from '@ant-design/icons';
import { useFriendCounts } from '@/contexts/FriendCountsContext';
import UserItem from '@/components/Friends/UserItem';
import styles from './friends-list.module.scss';

interface User {
  id: string;
  name: string | null;
  email: string;
  image_preview?: string | null;
}

const FriendsList: React.FC = () => {
  const [friends, setFriends] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { refetchCounts } = useFriendCounts();

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const response = await fetch('/api/friends?type=friends');
      if (response.ok) {
        const data = await response.json();
        setFriends(data);
      }
    } catch (error) {
      console.error('Не удалось получить список друзей:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFriend = async (userId: string) => {
    try {
      const response = await fetch('/api/friends/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });

      if (response.ok) {
        setFriends(friends.filter(f => f.id !== userId));
        await refetchCounts();
      }
    } catch (error) {
      console.error('Не удалось удалить друга:', error);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  if (friends.length === 0) {
    return <div className={styles.empty}>Список друзей пустой</div>;
  }

  return (
    <div className={styles.list}>
      {friends.map(friend => (
        <UserItem
          key={friend.id}
          user={friend}
          actions={
            <Button
              size="small"
              icon={<UserDeleteOutlined />}
              onClick={() => handleRemoveFriend(friend.id)}
            >
              Удалить
            </Button>
          }
        />
      ))}
    </div>
  );
};

export default FriendsList;
