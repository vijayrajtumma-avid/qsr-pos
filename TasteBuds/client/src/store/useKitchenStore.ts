import { create } from 'zustand';
import { OrderItem } from './useOrderStore';
import { firebaseOrdersService } from '@/services/firebaseOrders';
import { offlineSyncService } from '@/services/offlineSync';

export type OrderStatus = 'new' | 'preparing' | 'ready';

export interface KitchenOrder {
  id: string;
  orderNumber: number;
  items: OrderItem[];
  subtotal: number;
  discountPercentage: number;
  discountAmount: number;
  gst: number;
  total: number;
  status: OrderStatus;
  timestamp: string;
  paymentMethod: string;
}

interface KitchenState {
  orders: KitchenOrder[];
  orderCounter: number;
  setOrders: (orders: KitchenOrder[]) => void;
  addOrder: (
    items: OrderItem[], 
    subtotal: number, 
    discountPercentage: number, 
    discountAmount: number, 
    gst: number, 
    total: number, 
    paymentMethod: string
  ) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  removeOrder: (orderId: string) => void;
  syncOrderCounter: () => void;
}

export const useKitchenStore = create<KitchenState>((set, get) => ({
  orders: [],
  orderCounter: 1,
  
  setOrders: (orders) => {
    set({ orders });
    get().syncOrderCounter();
  },
  
  syncOrderCounter: () => {
    const { orders } = get();
    if (orders.length > 0) {
      const maxOrderNumber = Math.max(...orders.map(o => o.orderNumber));
      set({ orderCounter: maxOrderNumber + 1 });
    }
  },
  
  addOrder: async (items, subtotal, discountPercentage, discountAmount, gst, total, paymentMethod) => {
    const orderNumber = get().orderCounter;
    const newOrder: Omit<KitchenOrder, 'id'> = {
      orderNumber,
      items,
      subtotal,
      discountPercentage,
      discountAmount,
      gst,
      total,
      status: 'new',
      timestamp: new Date().toISOString(),
      paymentMethod,
    } as Omit<KitchenOrder, 'id'>;
    
    try {
      // Save to IndexedDB first (works offline)
      const orderId = await offlineSyncService.saveOrderLocally(newOrder);
      
      // Update local state with the new order
      const orderWithId: KitchenOrder = { ...newOrder, id: orderId };
      set((state) => ({
        orders: [orderWithId, ...state.orders],
        orderCounter: state.orderCounter + 1,
      }));
      
      console.log(`✅ Order #${orderNumber} saved (${offlineSyncService.getOnlineStatus() ? 'will sync to Firebase' : 'offline, queued for sync'})`);
    } catch (error) {
      console.error('Error adding order:', error);
      // Fallback to basic local state
      set((state) => ({
        orders: [...state.orders, { ...newOrder, id: Date.now().toString() } as KitchenOrder],
        orderCounter: state.orderCounter + 1,
      }));
    }
  },
  
  updateOrderStatus: async (orderId, status) => {
    try {
      // Update IndexedDB first (works offline)
      await offlineSyncService.updateOrderStatusLocally(orderId, status);
      
      // Update local state immediately
      set((state) => ({
        orders: state.orders.map((order) =>
          order.id === orderId ? { ...order, status } : order
        ),
      }));
      
      console.log(`✅ Order status updated (${offlineSyncService.getOnlineStatus() ? 'will sync to Firebase' : 'offline, queued for sync'})`);
    } catch (error) {
      console.error('Error updating order status:', error);
      // Fallback to local state
      set((state) => ({
        orders: state.orders.map((order) =>
          order.id === orderId ? { ...order, status } : order
        ),
      }));
    }
  },
  
  removeOrder: (orderId) => {
    set((state) => ({
      orders: state.orders.filter((order) => order.id !== orderId),
    }));
  },
}));
