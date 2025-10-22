import { create } from 'zustand';

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
}

export interface OrderModifiers {
  sugarLevel: 'no_sugar' | 'less_sugar' | 'regular' | 'extra_sugar';
  size: 'small' | 'medium' | 'large';
  addOns: {
    extraGinger: boolean;
    extraElaichi: boolean;
  };
}

export interface OrderItem extends MenuItem {
  quantity: number;
  modifiers: OrderModifiers;
  itemTotal: number;
}

interface OrderState {
  order: OrderItem[];
  discountPercentage: number;
  addToOrder: (item: MenuItem, modifiers: OrderModifiers, quantity: number) => void;
  updateQuantity: (id: number, modifiersKey: string, change: number) => void;
  removeItem: (id: number, modifiersKey: string) => void;
  setDiscountPercentage: (percentage: number) => void;
  clearOrder: () => void;
  getSubtotal: () => number;
  getDiscount: () => number;
  getGST: () => number;
  getTotal: () => number;
}

const createModifiersKey = (modifiers: OrderModifiers): string => {
  return JSON.stringify(modifiers);
};

const calculateItemPrice = (basePrice: number, modifiers: OrderModifiers): number => {
  let price = basePrice;
  
  // Size pricing
  if (modifiers.size === 'large') {
    price += 10;
  }
  
  // Add-ons pricing
  if (modifiers.addOns.extraGinger) {
    price += 5;
  }
  if (modifiers.addOns.extraElaichi) {
    price += 3;
  }
  
  return price;
};

export const useOrderStore = create<OrderState>((set, get) => ({
  order: [],
  discountPercentage: 0,
  
  addToOrder: (item, modifiers, quantity) => {
    const modifiersKey = createModifiersKey(modifiers);
    const itemPrice = calculateItemPrice(item.price, modifiers);
    const itemTotal = itemPrice * quantity;
    
    set((state) => {
      const existingItemIndex = state.order.findIndex(
        (orderItem) => 
          orderItem.id === item.id && 
          createModifiersKey(orderItem.modifiers) === modifiersKey
      );
      
      if (existingItemIndex >= 0) {
        // Update existing item
        const newOrder = [...state.order];
        newOrder[existingItemIndex] = {
          ...newOrder[existingItemIndex],
          quantity: newOrder[existingItemIndex].quantity + quantity,
          itemTotal: (newOrder[existingItemIndex].quantity + quantity) * itemPrice,
        };
        return { order: newOrder };
      } else {
        // Add new item
        return {
          order: [
            ...state.order,
            {
              ...item,
              quantity,
              modifiers,
              itemTotal,
            },
          ],
        };
      }
    });
  },
  
  updateQuantity: (id, modifiersKey, change) => {
    set((state) => {
      const newOrder = state.order
        .map((item) => {
          if (item.id === id && createModifiersKey(item.modifiers) === modifiersKey) {
            const newQuantity = item.quantity + change;
            if (newQuantity <= 0) return null;
            const itemPrice = calculateItemPrice(item.price, item.modifiers);
            return {
              ...item,
              quantity: newQuantity,
              itemTotal: itemPrice * newQuantity,
            };
          }
          return item;
        })
        .filter((item): item is OrderItem => item !== null);
      
      return { order: newOrder };
    });
  },
  
  removeItem: (id, modifiersKey) => {
    set((state) => ({
      order: state.order.filter(
        (item) => !(item.id === id && createModifiersKey(item.modifiers) === modifiersKey)
      ),
    }));
  },
  
  setDiscountPercentage: (percentage) => {
    const validPercentage = Math.max(0, Math.min(100, percentage));
    set({ discountPercentage: validPercentage });
  },
  
  clearOrder: () => set({ order: [], discountPercentage: 0 }),
  
  getSubtotal: () => {
    return get().order.reduce((sum, item) => sum + item.itemTotal, 0);
  },
  
  getDiscount: () => {
    const subtotal = get().getSubtotal();
    const discountPercentage = get().discountPercentage;
    return (subtotal * discountPercentage) / 100;
  },
  
  getGST: () => {
    const subtotal = get().getSubtotal();
    const discount = get().getDiscount();
    return (subtotal - discount) * 0.05;
  },
  
  getTotal: () => {
    const subtotal = get().getSubtotal();
    const discount = get().getDiscount();
    const gst = get().getGST();
    return subtotal - discount + gst;
  },
}));
