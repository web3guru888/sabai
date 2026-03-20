import { useTranslation } from 'react-i18next';
import { categories } from '../data/products';

interface CategoryFilterProps {
  selected: string | null;
  onSelect: (categoryId: string | null) => void;
}

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'th' | 'en';

  return (
    <div className="flex gap-2 overflow-x-auto hide-scrollbar py-2 px-4">
      <button
        onClick={() => onSelect(null)}
        className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
          selected === null
            ? 'bg-sabai-gold text-sabai-dark'
            : 'bg-sabai-card text-sabai-muted hover:text-sabai-text'
        }`}
      >
        {t('home.allCategories')}
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
            selected === cat.id
              ? 'bg-sabai-gold text-sabai-dark'
              : 'bg-sabai-card text-sabai-muted hover:text-sabai-text'
          }`}
        >
          {cat.emoji} {cat.name[lang] || cat.name.th}
        </button>
      ))}
    </div>
  );
}
