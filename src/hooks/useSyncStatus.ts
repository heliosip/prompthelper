// src/hooks/useSyncStatus.ts

import { useState, useEffect } from 'react';
import type { SyncState } from '@/components/SyncStatus';

interface UseSyncStatusProps {
  onOffline?: () => void;
  onOnline?: () => void;
}

export const useSyncStatus = ({ onOffline, onOnline }: UseSyncStatusProps = {}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncState, setSyncState] = useState<SyncState>(navigator.onLine ? 'synced' : 'offline');
  const [lastSyncTime, setLastSyncTime] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncState('synced');
      onOnline?.();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncState('offline');
      onOffline?.();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [onOnline, onOffline]);

  const startSync = async (syncFunction: () => Promise<void>) => {
    if (!isOnline) {
      setSyncState('offline');
      return;
    }

    try {
      setSyncState('syncing');
      await syncFunction();
      setSyncState('synced');
      setLastSyncTime(new Date().toISOString());
      setError(undefined);
    } catch (err: any) {
      setSyncState('error');
      setError(err.message || 'Sync failed');
    }
  };

  return {
    isOnline,
    syncState,
    lastSyncTime,
    error,
    startSync
  };
};

export type { SyncState };