import { describe, it, expect, beforeEach } from 'vitest';
import { useOrdersStore } from '../../src/stores/ordersStore';
import type { Order } from '../../src/types';

function makeOrder(overrides?: Partial<Order>): Order {
  return {
    id: 'order-001',
    items: [
      {
        product: {
          id: 'prod-1',
          name: { th: 'เบียร์', en: 'Beer' },
          description: { th: 'รายละเอียด', en: 'Description' },
          price: 250,
          image: 'https://example.com/beer.jpg',
          category: 'beer',
          inStock: true,
        },
        quantity: 2,
      },
    ],
    subtotal: 500,
    deliveryFee: 50,
    total: 550,
    address: '123 Sukhumvit Rd, Bangkok',
    timeSlot: '14:00-16:00',
    paymentMethod: 'promptpay',
    createdAt: '2024-01-15T10:30:00.000Z',
    ...overrides,
  };
}

describe('Orders Store', () => {
  beforeEach(() => {
    useOrdersStore.setState({ orders: [] });
  });

  it('starts with empty orders', () => {
    const state = useOrdersStore.getState();
    expect(state.orders).toHaveLength(0);
  });

  it('adds an order', () => {
    const order = makeOrder();
    useOrdersStore.getState().addOrder(order);

    const state = useOrdersStore.getState();
    expect(state.orders).toHaveLength(1);
    expect(state.orders[0].id).toBe('order-001');
  });

  it('adds multiple orders (newest first)', () => {
    useOrdersStore.getState().addOrder(makeOrder({ id: 'order-001' }));
    useOrdersStore.getState().addOrder(makeOrder({ id: 'order-002' }));
    useOrdersStore.getState().addOrder(makeOrder({ id: 'order-003' }));

    const state = useOrdersStore.getState();
    expect(state.orders).toHaveLength(3);
    // Newest should be first (prepended)
    expect(state.orders[0].id).toBe('order-003');
    expect(state.orders[1].id).toBe('order-002');
    expect(state.orders[2].id).toBe('order-001');
  });

  it('gets order by ID', () => {
    useOrdersStore.getState().addOrder(makeOrder({ id: 'order-001' }));
    useOrdersStore.getState().addOrder(makeOrder({ id: 'order-002' }));

    const order = useOrdersStore.getState().getOrder('order-001');
    expect(order).toBeDefined();
    expect(order?.id).toBe('order-001');
  });

  it('returns undefined for non-existent order ID', () => {
    useOrdersStore.getState().addOrder(makeOrder({ id: 'order-001' }));

    const order = useOrdersStore.getState().getOrder('nonexistent');
    expect(order).toBeUndefined();
  });

  it('preserves full order data', () => {
    const order = makeOrder({
      id: 'order-full',
      subtotal: 500,
      deliveryFee: 50,
      total: 550,
      address: '456 Silom Rd',
      timeSlot: '10:00-12:00',
      paymentMethod: 'linepay',
    });

    useOrdersStore.getState().addOrder(order);

    const retrieved = useOrdersStore.getState().getOrder('order-full');
    expect(retrieved?.subtotal).toBe(500);
    expect(retrieved?.deliveryFee).toBe(50);
    expect(retrieved?.total).toBe(550);
    expect(retrieved?.address).toBe('456 Silom Rd');
    expect(retrieved?.timeSlot).toBe('10:00-12:00');
    expect(retrieved?.paymentMethod).toBe('linepay');
    expect(retrieved?.items).toHaveLength(1);
  });

  it('supports all payment methods', () => {
    const methods = ['linepay', 'promptpay', 'cod'] as const;

    for (const method of methods) {
      useOrdersStore.setState({ orders: [] });
      useOrdersStore.getState().addOrder(makeOrder({ id: `order-${method}`, paymentMethod: method }));

      const order = useOrdersStore.getState().getOrder(`order-${method}`);
      expect(order?.paymentMethod).toBe(method);
    }
  });
});
