'use client';

import React, { createContext, useContext, useCallback, useState } from 'react';

export interface Counts {
  friends: number;
  requests: number;
  followers: number;
  outgoing: number;
  blocked: number;
}

interface FriendCountsContextType {
  counts: Counts | null;
  loading: boolean;
  refetchCounts: () => Promise<void>;
}

const FriendCountsContext = createContext<FriendCountsContextType | undefined>(undefined);

export const FriendCountsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCounts = useCallback(async () => {
    try {
      const response = await fetch('/api/friends/counts');
      if (response.ok) {
        const data = await response.json();
        setCounts(data);
      }
    } catch (error) {
      console.error('Failed to fetch counts:', error);
    }
  }, []);

  const refetchCounts = useCallback(async () => {
    await fetchCounts();
  }, [fetchCounts]);

  React.useEffect(() => {
    const initCounts = async () => {
      await fetchCounts();
      setLoading(false);
    };
    initCounts();
  }, [fetchCounts]);

  return (
    <FriendCountsContext.Provider value={{ counts, loading, refetchCounts }}>
      {children}
    </FriendCountsContext.Provider>
  );
};

export const useFriendCounts = () => {
  const context = useContext(FriendCountsContext);
  if (!context) {
    throw new Error('useFriendCounts must be used within FriendCountsProvider');
  }
  return context;
};
