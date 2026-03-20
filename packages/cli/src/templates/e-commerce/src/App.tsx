import { useState, useEffect } from 'react';
import { useLiff } from '@sabai/core';
import { Loading, AgeVerification, PdpaConsent, ErrorBoundary } from '@sabai/ui';
import { useAppStore } from './stores/appStore';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { ProductPage } from './pages/ProductPage';
import { SearchPage } from './pages/SearchPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { ProfilePage } from './pages/ProfilePage';

function AppContent() {
  const {
    isAgeVerified,
    isPdpaConsented,
    currentPage,
    setAgeVerified,
    setPdpaConsented,
  } = useAppStore();

  // Initialize LIFF
  const { isReady, error } = useLiff({
    liffId: import.meta.env.VITE_LIFF_ID || 'placeholder',
    mockMode: import.meta.env.VITE_MOCK_MODE === 'true',
  });

  // Timeout fallback — don't block the app if LIFF init hangs in mock mode
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  const liffDone = isReady || timedOut || !!error;

  // Loading state
  if (!liffDone) {
    return <Loading message="กำลังโหลด..." />;
  }

  // Age verification gate
  if (!isAgeVerified) {
    return (
      <AgeVerification
        minimumAge={20}
        onVerified={() => setAgeVerified(true)}
      />
    );
  }

  // PDPA consent gate
  if (!isPdpaConsented) {
    return (
      <PdpaConsent
        onAccept={() => setPdpaConsented(true)}
        items={[
          {
            id: 'data-collection',
            label: 'การเก็บรวบรวมข้อมูลส่วนบุคคล / Personal data collection',
            required: true,
          },
          {
            id: 'marketing',
            label: 'การสื่อสารทางการตลาด / Marketing communications',
            required: false,
          },
          {
            id: 'third-party',
            label: 'การแบ่งปันข้อมูลกับบุคคลที่สาม / Third-party data sharing',
            required: false,
          },
        ]}
      />
    );
  }

  // Pages that don't show bottom nav
  const hideNav = currentPage === 'checkout' || currentPage === 'order-confirmation';

  // Page router
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'product':
        return <ProductPage />;
      case 'search':
        return <SearchPage />;
      case 'cart':
        return <CartPage />;
      case 'checkout':
        return <CheckoutPage />;
      case 'order-confirmation':
        return <OrderConfirmationPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <HomePage />;
    }
  };

  return <Layout hideNav={hideNav}>{renderPage()}</Layout>;
}

function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;
