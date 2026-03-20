import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAppStore } from '../stores/appStore';
import { useOrdersStore } from '../stores/ordersStore';
import { buildOrderConfirmationFlex, shareMessage } from '@sabai/core';

export function OrderConfirmationPage() {
  const { t, i18n } = useTranslation();
  const { pageParam, navigate } = useAppStore();
  const getOrder = useOrdersStore((s) => s.getOrder);

  const lang = i18n.language as 'th' | 'en';
  const order = pageParam ? getOrder(pageParam) : undefined;

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sabai-muted">
        Order not found
      </div>
    );
  }

  const handleShare = async () => {
    try {
      const flex = buildOrderConfirmationFlex({
        orderId: order.id,
        items: order.items.map((i) => ({
          name: i.product.name[lang] || i.product.name.th,
          quantity: i.quantity,
          price: i.product.price,
        })),
        total: order.total,
      });
      await shareMessage([flex as unknown as Record<string, unknown>]);
    } catch {
      // Share not available in browser mode — that's OK
      alert('LINE Share is only available inside the LINE app');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen flex flex-col items-center px-4 pt-12"
    >
      {/* Success animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        className="w-20 h-20 rounded-full bg-green-600 flex items-center justify-center text-3xl mb-6"
      >
        ✓
      </motion.div>

      <h1 className="text-2xl font-bold mb-2">{t('order.confirmed')}</h1>
      <p className="text-sabai-muted mb-6">{t('order.thankYou')}</p>

      {/* Order Number */}
      <div className="bg-sabai-card rounded-xl p-4 w-full max-w-sm text-center mb-6">
        <span className="text-sm text-sabai-muted">{t('order.orderNumber')}</span>
        <p className="text-xl font-bold text-sabai-gold mt-1">{order.id}</p>
      </div>

      {/* Order summary */}
      <div className="bg-sabai-card rounded-xl p-4 w-full max-w-sm mb-6">
        <h3 className="font-semibold text-sm mb-3">{t('order.items')}</h3>
        {order.items.map(({ product, quantity }) => (
          <div key={product.id} className="flex justify-between text-sm py-1">
            <span className="text-sabai-muted">
              {product.name[lang] || product.name.th} x{quantity}
            </span>
            <span>
              {t('currency')}
              {(product.price * quantity).toLocaleString()}
            </span>
          </div>
        ))}
        <div className="border-t border-sabai-surface mt-3 pt-3 flex justify-between font-bold">
          <span>{t('order.total')}</span>
          <span className="text-sabai-gold">
            {t('currency')}
            {order.total.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="w-full max-w-sm space-y-3">
        <button
          onClick={handleShare}
          className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
        >
          {t('order.shareOnLine')}
        </button>
        <button
          onClick={() => navigate('home')}
          className="w-full bg-sabai-card text-sabai-text py-3 rounded-xl font-semibold hover:bg-sabai-surface transition-colors"
        >
          {t('order.continueShopping')}
        </button>
      </div>
    </motion.div>
  );
}
