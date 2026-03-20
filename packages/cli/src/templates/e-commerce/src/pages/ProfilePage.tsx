import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useLiff } from '@sabai/core';
import { useAppStore } from '../stores/appStore';
import { useOrdersStore } from '../stores/ordersStore';

export function ProfilePage() {
  const { t, i18n } = useTranslation();
  const { language, setLanguage, navigate } = useAppStore();
  const orders = useOrdersStore((s) => s.orders);
  const lang = i18n.language as 'th' | 'en';

  const { profile, isLoggedIn, logout } = useLiff({
    liffId: import.meta.env.VITE_LIFF_ID || 'placeholder',
    mockMode: import.meta.env.VITE_MOCK_MODE === 'true',
  });

  const toggleLanguage = () => {
    const newLang = language === 'th' ? 'en' : 'th';
    setLanguage(newLang);
    void i18n.changeLanguage(newLang);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen">
      <div className="px-4 pt-6">
        <h1 className="text-2xl font-bold mb-6">{t('profile.title')}</h1>

        {/* User profile card */}
        <div className="bg-sabai-card rounded-xl p-6 flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-sabai-surface flex items-center justify-center text-3xl overflow-hidden flex-shrink-0">
            {profile?.pictureUrl ? (
              <img
                src={profile.pictureUrl}
                alt={profile.displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              '👤'
            )}
          </div>
          <div>
            <h2 className="font-semibold text-lg">
              {isLoggedIn ? profile?.displayName : t('profile.guest')}
            </h2>
            {!isLoggedIn && (
              <p className="text-sabai-muted text-sm mt-1">{t('profile.loginPrompt')}</p>
            )}
          </div>
        </div>

        {/* Language toggle */}
        <div className="bg-sabai-card rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">{t('profile.language')}</span>
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 bg-sabai-surface px-4 py-2 rounded-lg text-sm font-medium hover:ring-1 hover:ring-sabai-gold/30 transition-all"
            >
              <span>{language === 'th' ? '🇹🇭 ไทย' : '🇬🇧 English'}</span>
              <span className="text-sabai-muted">→</span>
              <span>{language === 'th' ? '🇬🇧 EN' : '🇹🇭 TH'}</span>
            </button>
          </div>
        </div>

        {/* Order History */}
        <div className="bg-sabai-card rounded-xl p-4 mb-4">
          <h3 className="font-semibold mb-3">{t('profile.orderHistory')}</h3>
          {orders.length === 0 ? (
            <p className="text-sabai-muted text-sm">{t('profile.noOrders')}</p>
          ) : (
            <div className="space-y-2">
              {orders.map((order) => (
                <button
                  key={order.id}
                  onClick={() => navigate('order-confirmation', order.id)}
                  className="w-full flex items-center justify-between bg-sabai-surface rounded-lg p-3 hover:ring-1 hover:ring-sabai-gold/30 transition-all"
                >
                  <div className="text-left">
                    <p className="text-sm font-medium">{order.id}</p>
                    <p className="text-xs text-sabai-muted">
                      {new Date(order.createdAt).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US')}
                    </p>
                  </div>
                  <span className="text-sabai-gold font-semibold text-sm">
                    {t('currency')}
                    {order.total.toLocaleString()}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Logout */}
        {isLoggedIn && (
          <button
            onClick={() => void logout()}
            className="w-full bg-sabai-card text-sabai-error py-3 rounded-xl font-semibold hover:bg-sabai-surface transition-colors"
          >
            {t('profile.logout')}
          </button>
        )}
      </div>

      <div className="h-8" />
    </motion.div>
  );
}
