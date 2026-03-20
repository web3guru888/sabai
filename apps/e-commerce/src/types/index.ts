// SipSabai — Application-specific TypeScript types

export interface Product {
  id: string;
  name: { th: string; en: string };
  description: { th: string; en: string };
  price: number;
  image: string;
  category: string;
  inStock: boolean;
  volume?: string;
  origin?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  address: string;
  timeSlot: string;
  paymentMethod: 'linepay' | 'promptpay' | 'cod';
  createdAt: string;
}

export interface TimeSlot {
  id: string;
  label: string;
  available: boolean;
}

export type PageId =
  | 'home'
  | 'search'
  | 'cart'
  | 'profile'
  | 'product'
  | 'checkout'
  | 'order-confirmation';
