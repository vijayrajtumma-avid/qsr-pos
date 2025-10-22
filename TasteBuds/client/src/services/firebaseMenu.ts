import { ref, set, get, remove, update } from 'firebase/database';
import { realtimeDb } from './firebase';

export interface MenuItem {
  id: string;
  name: string;
  category: 'hot_drinks' | 'cold_drinks' | 'snacks' | 'combos';
  price: number;
  gstRate: number;
}

class FirebaseMenuService {
  private menuRef = ref(realtimeDb, 'menuItems');

  async getAllMenuItems(): Promise<MenuItem[]> {
    try {
      const snapshot = await get(this.menuRef);
      if (!snapshot.exists()) {
        return [];
      }

      const data = snapshot.val();
      return Object.keys(data).map((key) => ({
        id: key,
        ...data[key],
      }));
    } catch (error) {
      console.error('Error fetching menu items:', error);
      return [];
    }
  }

  async createMenuItem(item: Omit<MenuItem, 'id'>): Promise<string> {
    try {
      const newRef = ref(realtimeDb, `menuItems/${Date.now()}`);
      await set(newRef, item);
      return newRef.key!;
    } catch (error) {
      console.error('Error creating menu item:', error);
      throw error;
    }
  }

  async updateMenuItem(id: string, item: Partial<Omit<MenuItem, 'id'>>): Promise<void> {
    try {
      const itemRef = ref(realtimeDb, `menuItems/${id}`);
      await update(itemRef, item);
    } catch (error) {
      console.error('Error updating menu item:', error);
      throw error;
    }
  }

  async deleteMenuItem(id: string): Promise<void> {
    try {
      const itemRef = ref(realtimeDb, `menuItems/${id}`);
      await remove(itemRef);
    } catch (error) {
      console.error('Error deleting menu item:', error);
      throw error;
    }
  }

  subscribeToMenuItems(callback: (items: MenuItem[]) => void): () => void {
    const unsubscribe = () => {
      // Firebase will handle cleanup
    };

    get(this.menuRef).then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const items = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        callback(items);
      } else {
        callback([]);
      }
    });

    return unsubscribe;
  }
}

export const firebaseMenuService = new FirebaseMenuService();
