'use client';

import React, { useEffect, useState } from 'react';
import { Button } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useFriendCounts } from '@/contexts/FriendCountsContext';
import UserItem from '@/components/Friends/UserItem';
import styles from './friends-list.module.scss';

interface User {
  id: string;
  name: string | null;
  email: string;
  image_preview?: string | null;
}

const FriendsRequests: React.FC = () => {
  const [requests, setRequests] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingOn, setActingOn] = useState<string | null>(null);
  const { refetchCounts } = useFriendCounts();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/friends?type=requests');
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (userId: string) => {
    setActingOn(userId);
    try {
      const response = await fetch('/api/friends/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requester_id: userId }),
      });

      if (response.ok) {
        setRequests(requests.filter(r => r.id !== userId));
        await refetchCounts();
      }
    } catch (error) {
      console.error('Failed to accept request:', error);
    } finally {
      setActingOn(null);
    }
  };

  const handleDecline = async (userId: string) => {
    setActingOn(userId);
    try {
      const response = await fetch('/api/friends/decline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requester_id: userId }),
      });

      if (response.ok) {
        setRequests(requests.filter(r => r.id !== userId));
        await refetchCounts();
      }
    } catch (error) {
      console.error('Failed to decline request:', error);
    } finally {
      setActingOn(null);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  if (requests.length === 0) {
    return <div className={styles.empty}>Список запросов пустой</div>;
  }

  return (
    <div className={styles.list}>
      {requests.map(request => (
        <UserItem
          key={request.id}
          user={request}
          actions={
            <div className={styles.actionGroup}>
              <Button
                type="primary"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleAccept(request.id)}
                disabled={actingOn === request.id}
                loading={actingOn === request.id}
              >
                В друзья
              </Button>
              <Button
                size="small"
                icon={<CloseOutlined />}
                onClick={() => handleDecline(request.id)}
                disabled={actingOn === request.id}
                loading={actingOn === request.id}
              >
                Отклонить
              </Button>
            </div>
          }
        />
      ))}
    </div>
  );
};

export default FriendsRequests;
