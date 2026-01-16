'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { generateAvatarDataUri } from '@/lib/generateAvatar';
import { getUserDisplayName } from '@/lib/getUserDisplayName';
import styles from './user-item.module.scss';

interface UserData {
  id: string;
  name: string | null;
  email: string;
  image_preview?: string | null;
}

interface UserItemProps {
  user: UserData;
  actions?: React.ReactNode;
  showOnlineStatus?: boolean;
}

const UserItem: React.FC<UserItemProps> = ({ user, actions, showOnlineStatus }) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    if (user.image_preview) {
      setAvatarUrl(user.image_preview);
      setIsLoading(false);
    } else {
      generateAvatarDataUri(user.id).then(url => {
        setAvatarUrl(url);
        setIsLoading(false);
      });
    }
  }, [user.id, user.image_preview]);

  const displayName = getUserDisplayName({
    name: user.name,
    email: user.email,
  });

  return (
    <div className={styles.userItem}>
      <Link href={`/profile/${user.id}`} className={styles.userLink}>
        <div className={styles.avatar}>
          {!isLoading && avatarUrl && (
            <Image
              src={avatarUrl}
              alt={displayName}
              width={48}
              height={48}
              className={styles.image}
            />
          )}
          {isLoading && <div className={styles.skeleton} />}
        </div>
        <div className={styles.info}>
          <div className={styles.name}>{displayName}</div>
        </div>
      </Link>
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
};

export default UserItem;
