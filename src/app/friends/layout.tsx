'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Badge } from 'antd';
import { FriendCountsProvider, useFriendCounts } from '@/contexts/FriendCountsContext';
import styles from './layout.module.scss';

interface Tab {
  name: string;
  path: string;
  label: string;
  countKey: string;
}

const tabs: Tab[] = [
  { name: 'list', path: '/friends', label: 'Друзья', countKey: 'friends' },
  { name: 'requests', path: '/friends/requests', label: 'Входящие запросы', countKey: 'requests' },
  { name: 'followers', path: '/friends/followers', label: 'Подписчики', countKey: 'followers' },
  { name: 'outgoing', path: '/friends/outgoing', label: 'Исходящие запросы', countKey: 'outgoing' },
  { name: 'blocked', path: '/friends/blocked', label: 'Заблокированные', countKey: 'blocked' },
];

interface FriendsLayoutProps {
  children: React.ReactNode;
}

const FriendsLayoutContent: React.FC<FriendsLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { counts, refetchCounts } = useFriendCounts();

  React.useEffect(() => {
    refetchCounts();
  }, [pathname, refetchCounts]);

  const getActiveTab = () => {
    const current = tabs.find(tab => tab.path === pathname);
    return current?.name || 'list';
  };

  const activeTab = getActiveTab();

  const handleTabChange = (path: string) => {
    router.push(path);
  };

  return (
    <div className={styles.container}>
      <div className={styles.tabsContainer}>
        {tabs.map(tab => {
          const count = counts ? counts[tab.countKey as keyof Counts] : 0;
          const showBadge = count > 0;

          return (
            <button
              key={tab.name}
              className={`${styles.tab} ${activeTab === tab.name ? styles.active : ''}`}
              onClick={() => handleTabChange(tab.path)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}
            >
              <div>{tab.label}</div>
              {showBadge && (
                <Badge
                  count={count.toLocaleString()}
                  color={'blue'}
                  overflowCount={1e6}
                />
              )}
            </button>
          );
        })}
      </div>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
};

const FriendsLayout: React.FC<FriendsLayoutProps> = ({ children }) => {
  return (
    <FriendCountsProvider>
      <FriendsLayoutContent>{children}</FriendsLayoutContent>
    </FriendCountsProvider>
  );
};

export default FriendsLayout;
