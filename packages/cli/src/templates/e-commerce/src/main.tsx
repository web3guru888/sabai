import React from 'react';
import ReactDOM from 'react-dom/client';
import { configureSabai } from '@sabai/core';
import App from './App';
import './i18n';
import './index.css';

// Configure Sabai environment
configureSabai({
  liffId: import.meta.env.VITE_LIFF_ID || 'placeholder',
  mockMode: import.meta.env.VITE_MOCK_MODE === 'true',
  appEnv:
    (import.meta.env.VITE_APP_ENV as 'development' | 'staging' | 'production') || 'development',
});

const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
