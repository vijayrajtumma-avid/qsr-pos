import { realtimeDb } from './firebase';
import { ref, push, update, onValue, off, set } from 'firebase/database';
import { KitchenOrder, OrderStatus } from '@/store/useKitchenStore';

const ORDERS_REF = 'orders';

export interface FirebaseOrder extends KitchenOrder {
  updatedAt?: string;
}

export const firebaseOrdersService = {
  // Create a new order
  createOrder: async (order: Omit<KitchenOrder, 'id'>): Promise<string> => {
    const ordersRef = ref(realtimeDb, ORDERS_REF);
    const newOrderRef = push(ordersRef);
    const orderId = newOrderRef.key!;
    
    const orderData: FirebaseOrder = {
      ...order,
      id: orderId,
      updatedAt: new Date().toISOString(),
    };
    
    await set(newOrderRef, orderData);
    return orderId;
  },

  // Update order status
  updateOrderStatus: async (orderId: string, status: OrderStatus): Promise<void> => {
    const orderRef = ref(realtimeDb, `${ORDERS_REF}/${orderId}`);
    await update(orderRef, {
      status,
      updatedAt: new Date().toISOString(),
    });
  },

  // Listen to all orders in real-time
  subscribeToOrders: (callback: (orders: KitchenOrder[]) => void): (() => void) => {
    const ordersRef = ref(realtimeDb, ORDERS_REF);
    
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const orders: KitchenOrder[] = Object.values(data);
        // Sort by timestamp (newest first)
        orders.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        callback(orders);
      } else {
        callback([]);
      }
    });

    // Return cleanup function
    return () => off(ordersRef, 'value', unsubscribe);
  },

  // Delete an order
  deleteOrder: async (orderId: string): Promise<void> => {
    const orderRef = ref(realtimeDb, `${ORDERS_REF}/${orderId}`);
    await set(orderRef, null);
  },
};
