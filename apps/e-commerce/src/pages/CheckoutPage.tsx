import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAppStore } from '../stores/appStore';
import { useCartStore } from '../stores/cartStore';
import { useOrdersStore } from '../stores/ordersStore';
import { TimeSlotPicker } from '../components/TimeSlotPicker';
import type { Order } from '../types';

type PaymentMethod = 'linepay' | 'promptpay' | 'cod';

const paymentMethods: { id: PaymentMethod; labelKey: string; icon: string }[] = [
  { id: 'linepay', labelKey: 'checkout.linePay', icon: '💚' },
  { id: 'promptpay', labelKey: 'checkout.promptPay', icon: '📱' },
  { id: 'cod', labelKey: 'checkout.cod', icon: '💵' },
];

export function CheckoutPage() {
  const { t } = useTranslation();
  const navigate = useAppStore((s) => s.navigate);
  const { items, getSubtotal, getDeliveryFee, getTotal, clearCart } = useCartStore();
  const addOrder = useOrdersStore((s) => s.addOrder);

  const [address, setAddress] = useState('');
  const [timeSlot, setTimeSlot] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('linepay');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = address.trim().length > 0 && timeSlot !== null && !isSubmitting;

  const handlePlaceOrder = () => {
    if (!canSubmit) return;
    setIsSubmitting(true);

    // Generate order ID
    const orderId = `SB-${Date.now().toString(36).toUpperCase()}`;
    const cartItems = Object.values(items);

    const order: Order = {
      id: orderId,
      items: cartItems,
      subtotal: getSubtotal(),
      deliveryFee: getDeliveryFee(),
      total: getTotal(),
      address,
      timeSlot: timeSlot ?? '',
      paymentMethod,
      createdAt: new Date().toISOString(),
    };

    addOrder(order);
    clearCart();

    // Navigate to confirmation
    navigate('order-confirmation', orderId);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen">
      <div className="px-4 pt-4">
        {/* Back button */}
        <button
          onClick={() => navigate('cart')}
          className="text-sabai-muted hover:text-sabai-text transition-colors text-sm mb-4"
        >
          ← {t('back')}
        </button>

        <h1 className="text-2xl font-bold mb-6">{t('checkout.title')}</h1>

        {/* Delivery Address */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2">
            {t('checkout.deliveryAddress')}
          </label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={t('checkout.addressPlaceholder')}
            rows={3}
            className="w-full bg-sabai-card rounded-xl px-4 py-3 text-sabai-text placeholder-sabai-muted focus:outline-none focus:ring-2 focus:ring-sabai-gold/50 resize-none"
          />
        </div>

        {/* Time Slot */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2">
            {t('checkout.timeSlot')}
          </label>
          <TimeSlotPicker selected={timeSlot} onSelect={setTimeSlot} />
        </div>

        {/* Payment Method */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2">
            {t('checkout.paymentMethod')}
          </label>
          <div className="space-y-2">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setPaymentMethod(method.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  paymentMethod === method.id
                    ? 'bg-sabai-gold text-sabai-dark ring-2 ring-sabai-gold-light'
                    : 'bg-sabai-card text-sabai-text hover:ring-1 hover:ring-sabai-gold/30'
                }`}
              >
                <span className="text-xl">{method.icon}</span>
                <span>{t(method.labelKey)}</span>
                {paymentMethod === method.id && <span className="ml-auto">✓</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Order summary */}
        <div className="bg-sabai-card rounded-xl p-4 mb-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-sabai-muted">{t('cart.subtotal')}</span>
            <span>
              {t('currency')}
              {getSubtotal().toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-sabai-muted">{t('cart.delivery')}</span>
            <span>
              {getDeliveryFee() === 0
                ? t('cart.deliveryFree')
                : `${t('currency')}${getDeliveryFee()}`}
            </span>
          </div>
          <div className="border-t border-sabai-surface pt-2 flex justify-between font-bold">
            <span>{t('cart.total')}</span>
            <span className="text-sabai-gold">
              {t('currency')}
              {getTotal().toLocaleString()}
            </span>
          </div>
        </div>

        {/* Place Order button */}
        <button
          onClick={handlePlaceOrder}
          disabled={!canSubmit}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
            canSubmit
              ? 'bg-sabai-gold text-sabai-dark hover:bg-sabai-gold-light'
              : 'bg-sabai-card text-sabai-muted cursor-not-allowed'
          }`}
        >
          {isSubmitting ? t('loading') : t('checkout.placeOrder')}
        </button>
      </div>

      <div className="h-8" />
    </motion.div>
  );
}
