import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAppStore } from '../stores/appStore';
import { useCartStore } from '../stores/cartStore';
import { ProductCard } from '../components/ProductCard';
import { products } from '../data/products';

export function ProductPage() {
  const { t, i18n } = useTranslation();
  const { pageParam, navigate } = useAppStore();
  const addToCart = useCartStore((s) => s.addToCart);
  const [quantity, setQuantity] = useState(1);
  const [showAdded, setShowAdded] = useState(false);

  const lang = i18n.language as 'th' | 'en';
  const product = products.find((p) => p.id === pageParam);

  if (!product) {
    return (
      <div className="p-8 text-center text-sabai-muted">
        Product not found
      </div>
    );
  }

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setShowAdded(true);
    setTimeout(() => setShowAdded(false), 1500);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen">
      {/* Back button */}
      <div className="px-4 pt-4">
        <button
          onClick={() => navigate('home')}
          className="text-sabai-muted hover:text-sabai-text transition-colors text-sm"
        >
          ← {t('back')}
        </button>
      </div>

      {/* Product image */}
      <div className="aspect-square max-w-sm mx-auto bg-sabai-surface flex items-center justify-center text-8xl rounded-2xl mx-4 mt-4">
        {product.image}
      </div>

      {/* Product info */}
      <div className="px-4 mt-6">
        <h1 className="text-2xl font-bold">
          {product.name[lang] || product.name.th}
        </h1>
        <p className="text-sabai-muted mt-2">
          {product.description[lang] || product.description.th}
        </p>

        <div className="flex items-center gap-4 mt-4">
          <span className="text-3xl font-bold text-sabai-gold">
            {t('currency')}
            {product.price.toLocaleString()}
          </span>
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              product.inStock
                ? 'bg-green-900/30 text-green-400'
                : 'bg-red-900/30 text-red-400'
            }`}
          >
            {product.inStock ? t('product.inStock') : t('product.outOfStock')}
          </span>
        </div>

        {/* Volume & Origin */}
        {(product.volume || product.origin) && (
          <div className="flex gap-4 mt-3 text-sm text-sabai-muted">
            {product.volume && (
              <span>
                {t('product.volume')}: {product.volume}
              </span>
            )}
            {product.origin && (
              <span>
                {t('product.origin')}: {product.origin}
              </span>
            )}
          </div>
        )}

        {/* Quantity + Add to cart */}
        {product.inStock && (
          <div className="flex items-center gap-4 mt-6">
            <div className="flex items-center bg-sabai-card rounded-xl overflow-hidden">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-4 py-3 text-sabai-muted hover:text-sabai-text transition-colors text-lg font-bold"
              >
                −
              </button>
              <span className="px-4 py-3 font-semibold min-w-[3rem] text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="px-4 py-3 text-sabai-muted hover:text-sabai-text transition-colors text-lg font-bold"
              >
                +
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                showAdded
                  ? 'bg-green-600 text-white'
                  : 'bg-sabai-gold text-sabai-dark hover:bg-sabai-gold-light'
              }`}
            >
              {showAdded ? `✓ ${t('product.added')}` : t('product.addToCart')}
            </button>
          </div>
        )}
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-8 px-4">
          <h2 className="text-lg font-semibold mb-3">
            {t('product.relatedProducts')}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      <div className="h-8" />
    </motion.div>
  );
}
