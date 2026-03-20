import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HeroBanner } from '../components/HeroBanner';
import { CategoryFilter } from '../components/CategoryFilter';
import { ProductCard } from '../components/ProductCard';
import { products } from '../data/products';

export function HomePage() {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category === selectedCategory)
    : products;

  return (
    <div className="min-h-screen">
      <HeroBanner />

      {/* Categories */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold px-4 mb-2">
          {t('home.categories')}
        </h2>
        <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
      </div>

      {/* Product Grid */}
      <div className="mt-6 px-4">
        <h2 className="text-lg font-semibold mb-3">
          {t('home.featured')}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      {/* Bottom spacer */}
      <div className="h-8" />
    </div>
  );
}
