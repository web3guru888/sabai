import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Order } from '../types';

interface OrdersState {
  orders: Order[];
  addOrder: (order: Order) => void;
  getOrder: (orderId: string) => Order | undefined;
}

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [],

      addOrder: (order) =>
        set((state) => ({
          orders: [order, ...state.orders],
        })),

      getOrder: (orderId) => {
        return get().orders.find((o) => o.id === orderId);
      },
    }),
    {
      name: 'sabai_orders',
    },
  ),
);
