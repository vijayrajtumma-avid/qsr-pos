import { db, SyncQueueEntry } from './db';
import { firebaseOrdersService } from './firebaseOrders';
import { KitchenOrder, OrderStatus } from '@/store/useKitchenStore';

class OfflineSyncService {
  private isOnline: boolean = navigator.onLine;
  private isSyncing: boolean = false;
  private syncListeners: Set<(pending: number) => void> = new Set();
  private connectionListeners: Set<(isOnline: boolean) => void> = new Set();

  constructor() {
    // Listen to online/offline events
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
    
    // Start periodic sync check
    setInterval(() => {
      if (this.isOnline && !this.isSyncing) {
        this.syncWithFirebase();
      }
    }, 5000); // Check every 5 seconds
    
    // Initial sync if online
    if (this.isOnline) {
      this.syncWithFirebase();
    }
  }

  private handleOnline = () => {
    console.log('🟢 Connection restored');
    this.isOnline = true;
    this.notifyConnectionListeners(true);
    this.syncWithFirebase();
  };

  private handleOffline = () => {
    console.log('🔴 Connection lost - working offline');
    this.isOnline = false;
    this.notifyConnectionListeners(false);
  };

  // Subscribe to pending sync count changes
  onSyncStatusChange(callback: (pending: number) => void): () => void {
    this.syncListeners.add(callback);
    // Send initial count
    this.getPendingCount().then(callback);
    return () => this.syncListeners.delete(callback);
  }

  // Subscribe to connection status changes
  onConnectionChange(callback: (isOnline: boolean) => void): () => void {
    this.connectionListeners.add(callback);
    // Send initial status
    callback(this.isOnline);
    return () => this.connectionListeners.delete(callback);
  }

  private notifySyncListeners(count: number) {
    this.syncListeners.forEach(listener => listener(count));
  }

  private notifyConnectionListeners(isOnline: boolean) {
    this.connectionListeners.forEach(listener => listener(isOnline));
  }

  async getPendingCount(): Promise<number> {
    return await db.syncQueue.count();
  }

  // Save order locally and queue for sync
  async saveOrderLocally(order: Omit<KitchenOrder, 'id'>): Promise<string> {
    const orderId = `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const orderWithId: KitchenOrder = {
      ...order,
      id: orderId,
    };

    // Save to IndexedDB
    await db.orders.put(orderWithId);

    // Queue for Firebase sync
    await this.queueOperation('create', 'orders', orderWithId);

    console.log(`💾 Order #${order.orderNumber} saved locally (${orderId})`);

    // Trigger sync if online
    if (this.isOnline) {
      this.syncWithFirebase();
    }

    return orderId;
  }

  // Update order status locally and queue for sync
  async updateOrderStatusLocally(orderId: string, status: OrderStatus): Promise<void> {
    const order = await db.orders.get(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    const updatedOrder = { ...order, status };
    await db.orders.put(updatedOrder);

    await this.queueOperation('update', 'orders', { id: orderId, status });

    console.log(`📝 Order #${order.orderNumber} status updated to ${status}`);

    if (this.isOnline) {
      this.syncWithFirebase();
    }
  }

  // Queue an operation for sync
  private async queueOperation(
    operation: 'create' | 'update' | 'delete',
    table: string,
    payload: any
  ): Promise<void> {
    await db.syncQueue.add({
      operation,
      table,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
    });

    const pendingCount = await this.getPendingCount();
    this.notifySyncListeners(pendingCount);
  }

  // Sync all pending operations with Firebase
  async syncWithFirebase(): Promise<void> {
    if (this.isSyncing || !this.isOnline) return;

    this.isSyncing = true;
    console.log('🔄 Starting sync with Firebase...');

    try {
      const queue = await db.syncQueue.orderBy('timestamp').toArray();
      
      if (queue.length === 0) {
        console.log('✅ No pending operations to sync');
        this.isSyncing = false;
        return;
      }

      console.log(`📤 Syncing ${queue.length} pending operations...`);

      for (const entry of queue) {
        try {
          await this.syncOperation(entry);
          
          // Remove from queue on success
          await db.syncQueue.delete(entry.id!);
          
          const pendingCount = await this.getPendingCount();
          this.notifySyncListeners(pendingCount);
        } catch (error) {
          console.error(`❌ Failed to sync operation ${entry.id}:`, error);
          
          // Update retry count
          const retryCount = (entry.retryCount || 0) + 1;
          await db.syncQueue.update(entry.id!, {
            retryCount,
            lastError: error instanceof Error ? error.message : 'Unknown error',
          });

          // If max retries reached, log and continue
          if (retryCount >= 5) {
            console.error(`🚫 Max retries reached for operation ${entry.id}, skipping`);
            await db.syncQueue.delete(entry.id!);
          }
          
          // Stop syncing on first failure to preserve order
          break;
        }
      }

      console.log('✅ Sync completed');
    } catch (error) {
      console.error('❌ Sync error:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  private async syncOperation(entry: SyncQueueEntry): Promise<void> {
    const { operation, payload } = entry;

    switch (operation) {
      case 'create':
        // Check if this is a local ID, and if so, create in Firebase
        if (payload.id.startsWith('local-')) {
          const { id: localId, ...orderData } = payload;
          const firebaseId = await firebaseOrdersService.createOrder(orderData);
          
          // Update local order with Firebase ID
          await db.orders.delete(localId);
          await db.orders.put({ ...payload, id: firebaseId });
          
          console.log(`✅ Order synced to Firebase (${localId} → ${firebaseId})`);
        } else {
          // Already has a Firebase ID, just ensure it exists
          await firebaseOrdersService.createOrder(payload);
        }
        break;

      case 'update':
        await firebaseOrdersService.updateOrderStatus(payload.id, payload.status);
        console.log(`✅ Order status updated in Firebase (${payload.id})`);
        break;

      case 'delete':
        await firebaseOrdersService.deleteOrder(payload.id);
        console.log(`✅ Order deleted from Firebase (${payload.id})`);
        break;
    }
  }

  // Load all orders from IndexedDB
  async getAllOrdersFromLocal(): Promise<KitchenOrder[]> {
    return await db.orders.orderBy('timestamp').reverse().toArray();
  }

  // Sync orders from Firebase to IndexedDB
  async syncFromFirebase(firebaseOrders: KitchenOrder[]): Promise<void> {
    // Update local database with Firebase orders
    for (const order of firebaseOrders) {
      // Only update if it's not a local-only order
      if (!order.id.startsWith('local-')) {
        await db.orders.put(order);
      }
    }
  }

  // Check if online
  getOnlineStatus(): boolean {
    return this.isOnline;
  }

  // Manual sync trigger
  async forceSyncNow(): Promise<void> {
    if (!this.isOnline) {
      throw new Error('Cannot sync while offline');
    }
    await this.syncWithFirebase();
  }
}

export const offlineSyncService = new OfflineSyncService();
