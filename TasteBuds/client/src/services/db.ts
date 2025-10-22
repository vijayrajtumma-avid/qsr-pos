import Dexie, { Table } from 'dexie';
import { KitchenOrder } from '@/store/useKitchenStore';

export interface SyncQueueEntry {
  id?: number;
  operation: 'create' | 'update' | 'delete';
  table: string;
  payload: any;
  timestamp: number;
  retryCount: number;
  lastError?: string;
}

export class OrderDatabase extends Dexie {
  orders!: Table<KitchenOrder, string>;
  syncQueue!: Table<SyncQueueEntry, number>;

  constructor() {
    super('OrderDatabase');
    
    this.version(1).stores({
      orders: 'id, orderNumber, status, timestamp',
      syncQueue: '++id, operation, timestamp, retryCount'
    });
  }
}

export const db = new OrderDatabase();
