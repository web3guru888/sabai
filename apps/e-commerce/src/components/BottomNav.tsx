import { useTranslation } from 'react-i18next';
import { useAppStore } from '../stores/appStore';
import { useCartStore } from '../stores/cartStore';
import type { PageId } from '../types';

interface NavItem {
  id: PageId;
  emoji: string;
  labelKey: string;
}

const navItems: NavItem[] = [
  { id: 'home', emoji: '🏠', labelKey: 'nav.home' },
  { id: 'search', emoji: '🔍', labelKey: 'nav.search' },
  { id: 'cart', emoji: '🛒', labelKey: 'nav.cart' },
  { id: 'profile', emoji: '👤', labelKey: 'nav.profile' },
];

export function BottomNav() {
  const { t } = useTranslation();
  const { currentPage, navigate } = useAppStore();
  const itemCount = useCartStore((s) => s.getItemCount());

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-sabai-surface border-t border-sabai-card safe-bottom z-50">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive =
            currentPage === item.id ||
            (item.id === 'home' &&
              !['search', 'cart', 'profile'].includes(currentPage));
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors relative ${
                isActive ? 'text-sabai-gold' : 'text-sabai-muted'
              }`}
            >
              <span className="text-xl relative">
                {item.emoji}
                {item.id === 'cart' && itemCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-sabai-error text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </span>
              <span className="text-xs mt-0.5 font-medium">{t(item.labelKey)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
