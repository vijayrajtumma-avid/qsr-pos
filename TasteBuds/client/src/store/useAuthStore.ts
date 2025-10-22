import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  isAuthenticated: boolean;
  login: (pin: string) => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      
      login: (pin: string) => {
        const adminPin = import.meta.env.VITE_ADMIN_PIN || '1234';
        
        if (pin === adminPin) {
          set({ isAuthenticated: true });
          return true;
        }
        return false;
      },
      
      logout: () => {
        set({ isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
