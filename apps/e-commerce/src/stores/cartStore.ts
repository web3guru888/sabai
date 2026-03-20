import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, CartItem } from '../types';

interface CartState {
  items: Record<string, CartItem>;

  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;

  getSubtotal: () => number;
  getDeliveryFee: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: {},

      addToCart: (product, quantity = 1) =>
        set((state) => {
          const existing = state.items[product.id];
          return {
            items: {
              ...state.items,
              [product.id]: {
                product,
                quantity: existing ? existing.quantity + quantity : quantity,
              },
            },
          };
        }),

      removeFromCart: (productId) =>
        set((state) => {
          const { [productId]: _, ...rest } = state.items;
          void _;
          return { items: rest };
        }),

      updateQuantity: (productId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            const { [productId]: _, ...rest } = state.items;
            void _;
            return { items: rest };
          }
          const existing = state.items[productId];
          if (!existing) return state;
          return {
            items: {
              ...state.items,
              [productId]: { ...existing, quantity },
            },
          };
        }),

      clearCart: () => set({ items: {} }),

      getSubtotal: () => {
        const { items } = get();
        return Object.values(items).reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0,
        );
      },

      getDeliveryFee: () => {
        const subtotal = get().getSubtotal();
        if (subtotal === 0) return 0;
        return subtotal >= 1000 ? 0 : 50;
      },

      getTotal: () => {
        return get().getSubtotal() + get().getDeliveryFee();
      },

      getItemCount: () => {
        const { items } = get();
        return Object.values(items).reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'sabai_cart',
    },
  ),
);
