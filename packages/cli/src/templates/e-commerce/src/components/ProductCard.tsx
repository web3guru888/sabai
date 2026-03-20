import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAppStore } from '../stores/appStore';
import { useCartStore } from '../stores/cartStore';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { t, i18n } = useTranslation();
  const navigate = useAppStore((s) => s.navigate);
  const addToCart = useCartStore((s) => s.addToCart);
  const [showAdded, setShowAdded] = useState(false);

  const lang = i18n.language as 'th' | 'en';
  const name = product.name[lang] || product.name.th;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.inStock) return;
    addToCart(product);
    setShowAdded(true);
    setTimeout(() => setShowAdded(false), 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => navigate('product', product.id)}
      className="bg-sabai-card rounded-xl overflow-hidden cursor-pointer hover:ring-1 hover:ring-sabai-gold/30 transition-all"
    >
      <div className="aspect-square bg-sabai-surface flex items-center justify-center text-5xl relative">
        {product.image}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-sabai-muted text-sm font-medium">
              {t('product.outOfStock')}
            </span>
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm truncate">{name}</h3>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sabai-gold font-bold text-lg">
            {t('currency')}
            {product.price.toLocaleString()}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
              showAdded
                ? 'bg-green-600 text-white'
                : product.inStock
                  ? 'bg-sabai-gold text-sabai-dark hover:bg-sabai-gold-light'
                  : 'bg-sabai-surface text-sabai-muted cursor-not-allowed'
            }`}
          >
            {showAdded ? t('product.added') : '+'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
