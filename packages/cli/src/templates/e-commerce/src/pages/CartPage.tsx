import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../stores/appStore';
import { useCartStore } from '../stores/cartStore';

export function CartPage() {
  const { t, i18n } = useTranslation();
  const navigate = useAppStore((s) => s.navigate);
  const { items, updateQuantity, removeFromCart, getSubtotal, getDeliveryFee, getTotal } =
    useCartStore();

  const lang = i18n.language as 'th' | 'en';
  const cartItems = Object.values(items);
  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const total = getTotal();
  const amountForFreeDelivery = Math.max(0, 1000 - subtotal);

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <span className="text-6xl mb-4">🛒</span>
        <h2 className="text-xl font-semibold mb-2">{t('cart.empty')}</h2>
        <p className="text-sabai-muted text-sm mb-6">{t('cart.emptyMessage')}</p>
        <button
          onClick={() => navigate('home')}
          className="bg-sabai-gold text-sabai-dark px-6 py-3 rounded-xl font-semibold hover:bg-sabai-gold-light transition-colors"
        >
          {t('nav.home')}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="px-4 pt-4">
        <h1 className="text-2xl font-bold mb-4">{t('nav.cart')}</h1>

        {/* Free delivery progress */}
        {amountForFreeDelivery > 0 ? (
          <div className="bg-sabai-card rounded-xl p-3 mb-4 text-sm text-sabai-muted">
            {t('cart.freeDeliveryNote', { amount: amountForFreeDelivery.toLocaleString() })}
          </div>
        ) : (
          <div className="bg-sabai-gold/10 border border-sabai-gold/20 rounded-xl p-3 mb-4 text-sm text-sabai-gold">
            {t('cart.freeDeliveryReached')}
          </div>
        )}

        {/* Cart items */}
        <AnimatePresence>
          {cartItems.map(({ product, quantity }) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              className="bg-sabai-card rounded-xl p-4 mb-3 flex gap-4"
            >
              {/* Product image */}
              <div className="w-16 h-16 bg-sabai-surface rounded-lg flex items-center justify-center text-3xl flex-shrink-0">
                {product.image}
              </div>

              {/* Product info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">
                  {product.name[lang] || product.name.th}
                </h3>
                <p className="text-sabai-gold font-bold text-sm mt-1">
                  {t('currency')}
                  {(product.price * quantity).toLocaleString()}
                </p>

                {/* Quantity controls */}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center bg-sabai-surface rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="px-3 py-1 text-sabai-muted hover:text-sabai-text text-sm font-bold"
                    >
                      −
                    </button>
                    <span className="px-3 py-1 text-sm font-medium">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="px-3 py-1 text-sabai-muted hover:text-sabai-text text-sm font-bold"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(product.id)}
                    className="text-sabai-error text-xs hover:underline"
                  >
                    {t('cart.removeItem')}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Summary */}
        <div className="bg-sabai-card rounded-xl p-4 mt-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-sabai-muted">{t('cart.subtotal')}</span>
            <span>
              {t('currency')}
              {subtotal.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-sabai-muted">{t('cart.delivery')}</span>
            <span className={deliveryFee === 0 ? 'text-green-400' : ''}>
              {deliveryFee === 0
                ? t('cart.deliveryFree')
                : `${t('currency')}${deliveryFee}`}
            </span>
          </div>
          <div className="border-t border-sabai-surface pt-3 flex justify-between font-bold text-lg">
            <span>{t('cart.total')}</span>
            <span className="text-sabai-gold">
              {t('currency')}
              {total.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Checkout button */}
        <button
          onClick={() => navigate('checkout')}
          className="w-full mt-4 bg-sabai-gold text-sabai-dark py-4 rounded-xl font-bold text-lg hover:bg-sabai-gold-light transition-colors"
        >
          {t('cart.checkout')}
        </button>
      </div>

      <div className="h-8" />
    </div>
  );
}
