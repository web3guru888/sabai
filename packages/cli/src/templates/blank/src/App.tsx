import { useState, useEffect } from 'react';
import { useLiff } from '@sabai/core';
import { AgeVerification, PdpaConsent, Loading, ErrorBoundary } from '@sabai/ui';

/**
 * {{PROJECT_NAME}} — LINE Mini App built with Sabai Framework
 *
 * This blank template includes:
 * - LIFF initialization with mock mode support
 * - Age verification gate (configurable minimum age)
 * - PDPA consent gate with required/optional items
 * - Simple welcome page as your starting point
 */

function AppContent() {
  const [isAgeVerified, setAgeVerified] = useState(false);
  const [isPdpaConsented, setPdpaConsented] = useState(false);

  // Initialize LIFF
  const { isReady, profile, error } = useLiff({
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

  // Main content — your app starts here!
  return (
    <div className="min-h-screen bg-sabai-dark text-sabai-text flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Welcome hero */}
        <div className="mb-8">
          <span className="text-6xl block mb-4">🌴</span>
          <h1 className="text-3xl font-bold text-sabai-gold mb-2">
            {{PROJECT_NAME}}
          </h1>
          <p className="text-sabai-muted">
            Your LINE Mini App is ready. Start building something amazing!
          </p>
        </div>

        {/* User info (from LIFF) */}
        {profile && (
          <div className="bg-sabai-card rounded-xl p-6 mb-6">
            <div className="flex items-center gap-4">
              {profile.pictureUrl && (
                <img
                  src={profile.pictureUrl}
                  alt={profile.displayName}
                  className="w-12 h-12 rounded-full"
                />
              )}
              <div className="text-left">
                <p className="font-semibold">{profile.displayName}</p>
                <p className="text-sabai-muted text-sm">Connected via LINE</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick links */}
        <div className="bg-sabai-card rounded-xl p-6 text-left space-y-3">
          <h2 className="font-semibold text-sabai-gold text-sm uppercase tracking-wide mb-3">
            Next Steps
          </h2>
          <div className="space-y-2 text-sm text-sabai-muted">
            <p>📝 Edit <code className="text-sabai-text bg-sabai-surface px-1 rounded">src/App.tsx</code> to start building</p>
            <p>🎨 Customize styles in <code className="text-sabai-text bg-sabai-surface px-1 rounded">tailwind.config.js</code></p>
            <p>🔑 Set your LIFF ID in <code className="text-sabai-text bg-sabai-surface px-1 rounded">.env.development</code></p>
            <p>📖 Read the docs at <code className="text-sabai-text bg-sabai-surface px-1 rounded">sabai.dev</code></p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-sabai-muted text-xs">
          Built with 🌴 Sabai Framework — สบาย~
        </p>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;
