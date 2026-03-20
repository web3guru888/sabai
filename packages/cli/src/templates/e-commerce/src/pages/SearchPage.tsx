import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ProductCard } from '../components/ProductCard';
import { products } from '../data/products';

export function SearchPage() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return products;
    const q = query.toLowerCase().trim();
    return products.filter(
      (p) =>
        p.name.th.toLowerCase().includes(q) ||
        p.name.en.toLowerCase().includes(q) ||
        p.description.th.toLowerCase().includes(q) ||
        p.description.en.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="min-h-screen">
      {/* Search input */}
      <div className="px-4 pt-4 sticky top-0 bg-sabai-dark z-10 pb-3">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sabai-muted">
            🔍
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('nav.search') + '...'}
            className="w-full bg-sabai-card rounded-xl pl-10 pr-4 py-3 text-sabai-text placeholder-sabai-muted focus:outline-none focus:ring-2 focus:ring-sabai-gold/50"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sabai-muted hover:text-sabai-text"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="px-4">
        {results.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 gap-3"
          >
            {results.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
        ) : (
          <div className="text-center text-sabai-muted py-20">
            <span className="text-4xl block mb-4">🔍</span>
            <p>{t('search.noResults')}</p>
          </div>
        )}
      </div>

      <div className="h-8" />
    </div>
  );
}
