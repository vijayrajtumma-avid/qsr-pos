import { useEffect, useState } from 'react';
import { offlineSyncService } from '@/services/offlineSync';

export function useSyncStatus() {
  const [pendingCount, setPendingCount] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Subscribe to sync status changes
    const unsubscribeSync = offlineSyncService.onSyncStatusChange((count) => {
      setPendingCount(count);
    });

    // Subscribe to connection status changes
    const unsubscribeConnection = offlineSyncService.onConnectionChange((online) => {
      setIsOnline(online);
    });

    return () => {
      unsubscribeSync();
      unsubscribeConnection();
    };
  }, []);

  return { pendingCount, isOnline };
}
