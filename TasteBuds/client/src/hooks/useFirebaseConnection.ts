import { useState, useEffect } from 'react';
import { realtimeDb } from '@/services/firebase';
import { ref, onValue, off } from 'firebase/database';

export const useFirebaseConnection = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const connectedRef = ref(realtimeDb, '.info/connected');
    
    const unsubscribe = onValue(connectedRef, (snapshot) => {
      const connected = snapshot.val() === true;
      setIsOnline(connected);
    });

    return () => off(connectedRef, 'value', unsubscribe);
  }, []);

  return isOnline;
};
