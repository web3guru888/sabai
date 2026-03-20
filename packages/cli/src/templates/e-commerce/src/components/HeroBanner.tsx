import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export function HeroBanner() {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative overflow-hidden bg-gradient-to-br from-sabai-surface via-sabai-dark to-sabai-card px-6 py-8 mx-4 mt-4 rounded-2xl"
    >
      {/* Decorative gold circle */}
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-sabai-gold/10 blur-2xl" />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-sabai-gold/5 blur-xl" />

      <div className="relative z-10">
        <h1 className="text-3xl font-bold text-sabai-gold mb-2">
          {t('home.heroTitle')}
        </h1>
        <p className="text-sabai-muted text-sm mb-4">
          {t('home.heroSubtitle')}
        </p>
        <div className="inline-block bg-sabai-gold/10 border border-sabai-gold/20 rounded-full px-4 py-1.5">
          <span className="text-sabai-gold text-xs font-medium">
            {t('home.promotion')}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
