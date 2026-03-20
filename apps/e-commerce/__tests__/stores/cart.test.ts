import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from '../../src/stores/cartStore';
import type { Product } from '../../src/types';

// Helper to create a test product
function makeProduct(overrides?: Partial<Product>): Product {
  return {
    id: 'prod-1',
    name: { th: 'สินค้าทดสอบ', en: 'Test Product' },
    description: { th: 'รายละเอียด', en: 'Description' },
    price: 250,
    image: 'https://example.com/img.jpg',
    category: 'beer',
    inStock: true,
    ...overrides,
  };
}

describe('Cart Store', () => {
  beforeEach(() => {
    // Reset store state
    useCartStore.setState({ items: {} });
  });

  it('starts with empty cart', () => {
    const state = useCartStore.getState();
    expect(Object.keys(state.items)).toHaveLength(0);
    expect(state.getItemCount()).toBe(0);
    expect(state.getSubtotal()).toBe(0);
  });

  it('adds item to cart', () => {
    const product = makeProduct();
    useCartStore.getState().addToCart(product);

    const state = useCartStore.getState();
    expect(state.items['prod-1']).toBeDefined();
    expect(state.items['prod-1'].product.id).toBe('prod-1');
    expect(state.items['prod-1'].quantity).toBe(1);
  });

  it('adds item with specified quantity', () => {
    const product = makeProduct();
    useCartStore.getState().addToCart(product, 3);

    const state = useCartStore.getState();
    expect(state.items['prod-1'].quantity).toBe(3);
  });

  it('increments quantity when adding existing item', () => {
    const product = makeProduct();
    useCartStore.getState().addToCart(product, 2);
    useCartStore.getState().addToCart(product, 3);

    const state = useCartStore.getState();
    expect(state.items['prod-1'].quantity).toBe(5);
  });

  it('removes item from cart', () => {
    const product = makeProduct();
    useCartStore.getState().addToCart(product);
    useCartStore.getState().removeFromCart('prod-1');

    const state = useCartStore.getState();
    expect(state.items['prod-1']).toBeUndefined();
  });

  it('updates quantity', () => {
    const product = makeProduct();
    useCartStore.getState().addToCart(product);
    useCartStore.getState().updateQuantity('prod-1', 5);

    const state = useCartStore.getState();
    expect(state.items['prod-1'].quantity).toBe(5);
  });

  it('removes item when quantity updated to 0', () => {
    const product = makeProduct();
    useCartStore.getState().addToCart(product);
    useCartStore.getState().updateQuantity('prod-1', 0);

    const state = useCartStore.getState();
    expect(state.items['prod-1']).toBeUndefined();
  });

  it('removes item when quantity updated to negative', () => {
    const product = makeProduct();
    useCartStore.getState().addToCart(product);
    useCartStore.getState().updateQuantity('prod-1', -1);

    const state = useCartStore.getState();
    expect(state.items['prod-1']).toBeUndefined();
  });

  it('update quantity does nothing for non-existent item', () => {
    useCartStore.getState().updateQuantity('nonexistent', 5);
    const state = useCartStore.getState();
    expect(Object.keys(state.items)).toHaveLength(0);
  });

  it('clears cart', () => {
    useCartStore.getState().addToCart(makeProduct({ id: 'p1' }));
    useCartStore.getState().addToCart(makeProduct({ id: 'p2' }));

    useCartStore.getState().clearCart();

    const state = useCartStore.getState();
    expect(Object.keys(state.items)).toHaveLength(0);
    expect(state.getItemCount()).toBe(0);
  });

  describe('subtotal calculation', () => {
    it('calculates subtotal for single item', () => {
      useCartStore.getState().addToCart(makeProduct({ id: 'p1', price: 100 }), 2);

      expect(useCartStore.getState().getSubtotal()).toBe(200);
    });

    it('calculates subtotal for multiple items', () => {
      useCartStore.getState().addToCart(makeProduct({ id: 'p1', price: 100 }), 2);
      useCartStore.getState().addToCart(makeProduct({ id: 'p2', price: 350 }), 1);

      expect(useCartStore.getState().getSubtotal()).toBe(550);
    });
  });

  describe('delivery fee calculation', () => {
    it('charges ฿50 delivery for orders under ฿1,000', () => {
      useCartStore.getState().addToCart(makeProduct({ id: 'p1', price: 500 }), 1);

      expect(useCartStore.getState().getDeliveryFee()).toBe(50);
    });

    it('free delivery for orders ≥ ฿1,000', () => {
      useCartStore.getState().addToCart(makeProduct({ id: 'p1', price: 500 }), 2);

      expect(useCartStore.getState().getDeliveryFee()).toBe(0);
    });

    it('free delivery for orders exactly ฿1,000', () => {
      useCartStore.getState().addToCart(makeProduct({ id: 'p1', price: 1000 }), 1);

      expect(useCartStore.getState().getDeliveryFee()).toBe(0);
    });

    it('charges fee for empty cart', () => {
      // Empty cart has subtotal 0 which is < 1000
      expect(useCartStore.getState().getDeliveryFee()).toBe(50);
    });
  });

  describe('total calculation', () => {
    it('total = subtotal + delivery fee (under ฿1,000)', () => {
      useCartStore.getState().addToCart(makeProduct({ id: 'p1', price: 300 }), 1);

      expect(useCartStore.getState().getTotal()).toBe(350); // 300 + 50 fee
    });

    it('total = subtotal when delivery is free (over ฿1,000)', () => {
      useCartStore.getState().addToCart(makeProduct({ id: 'p1', price: 600 }), 2);

      expect(useCartStore.getState().getTotal()).toBe(1200); // 1200 + 0 fee
    });
  });

  describe('item count', () => {
    it('counts total quantity across all items', () => {
      useCartStore.getState().addToCart(makeProduct({ id: 'p1' }), 2);
      useCartStore.getState().addToCart(makeProduct({ id: 'p2' }), 3);

      expect(useCartStore.getState().getItemCount()).toBe(5);
    });
  });
});
