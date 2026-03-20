# @sabai/core

> LIFF initialization, React hooks, i18n, and messaging for LINE Mini Apps.
>
> การเริ่มต้นใช้งาน LIFF, React hooks, i18n และการส่งข้อความสำหรับ LINE Mini App

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)](https://react.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)

---

## Installation / การติดตั้ง

```bash
pnpm add @sabai/core
```

**Peer dependencies:**

```bash
pnpm add react react-dom @line/liff i18next react-i18next
```

---

## Quick Start / เริ่มต้นอย่างรวดเร็ว

```tsx
import { useLiff } from '@sabai/core';

function App() {
  const { isReady, isLoggedIn, profile, login, logout } = useLiff({
    liffId: '1234567890-abcdefgh',
  });

  if (!isReady) return <div>Loading...</div>;
  if (!isLoggedIn) return <button onClick={() => login()}>Login with LINE</button>;

  return (
    <div>
      <p>สวัสดี {profile?.displayName}!</p>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
}
```

---

## API Reference / เอกสารอ้างอิง API

### Exports

| Export | Type | Description |
|--------|------|-------------|
| `initLiff` | `function` | Initialize LIFF SDK with retry logic and deduplication |
| `useLiff` | `hook` | React hook for LIFF state management |
| `configureSabai` | `function` | Set global environment configuration |
| `getSabaiConfig` | `function` | Retrieve current environment configuration |
| `getAccessToken` | `function` | Get the current LIFF access token |
| `getIdToken` | `function` | Get the current LIFF ID token (OIDC) |
| `login` | `function` | Trigger LINE login flow |
| `logout` | `function` | Log out and reload the page |
| `isInClient` | `function` | Check if running inside the LINE client |
| `setupI18n` | `function` | Initialize i18next with LINE language detection |
| `detectLineLanguage` | `function` | Detect user language from LINE/browser |
| `shareMessage` | `function` | Open LINE Share Target Picker |
| `sendServiceMessage` | `function` | Send push message via Messaging API |
| `buildOrderConfirmationFlex` | `function` | Build an order confirmation Flex Message |

### Type Exports

| Type | Description |
|------|-------------|
| `SabaiConfig` | Configuration for LIFF initialization |
| `LiffState` | Current state of the LIFF SDK |
| `LiffProfile` | LINE user profile information |
| `SabaiEnvConfig` | Module-level environment configuration |
| `I18nConfig` | Configuration for the i18n system |
| `ServiceMessageParams` | Parameters for push messaging |
| `FlexMessage` | LINE Flex Message object |
| `OrderConfirmation` | Data for order confirmation Flex Message |

---

## Features / คุณสมบัติ

### 1. LIFF Initialization / การเริ่มต้นใช้งาน LIFF

`initLiff` provides robust LIFF SDK initialization with:

- **Automatic retry** — Exponential backoff (1s → 2s → 4s), up to 3 attempts
- **Deduplication** — Safe for React StrictMode double-effects
- **Non-retryable error detection** — Stops immediately on `INVALID_ARGUMENT` or `UNAUTHORIZED`
- **Mock mode** — Local development without a real LINE account

```ts
import { initLiff } from '@sabai/core';

const state = await initLiff({
  liffId: '1234567890-abcdefgh',
  mockMode: import.meta.env.DEV,  // Mock mode in development
});

if (state.isReady && state.isLoggedIn) {
  console.log(`Hello, ${state.profile?.displayName}`);
}
```

#### Mock Mode / โหมดจำลอง

Enable mock mode for local development without a real LINE account:

```ts
const state = await initLiff({
  liffId: 'placeholder',
  mockMode: true,
});

// LIFF will initialize with a mock plugin
// All API calls return simulated data
```

> 💡 Mock mode uses `@line/liff-mock` internally. No LINE login screen is shown.

---

### 2. `useLiff` React Hook

The primary React interface for LIFF. Returns reactive state plus `login` and `logout` helpers.

```tsx
import { useLiff } from '@sabai/core';

function ProfileCard() {
  const { isReady, isLoggedIn, isInClient, profile, error, login, logout } = useLiff({
    liffId: import.meta.env.VITE_LIFF_ID,
    mockMode: import.meta.env.VITE_MOCK_MODE === 'true',
  });

  if (error) return <p>Error: {error.message}</p>;
  if (!isReady) return <p>กำลังโหลด... / Loading...</p>;

  if (!isLoggedIn) {
    return <button onClick={() => login()}>เข้าสู่ระบบ / Login</button>;
  }

  return (
    <div>
      <img src={profile?.pictureUrl} alt={profile?.displayName} />
      <h2>{profile?.displayName}</h2>
      <p>{profile?.statusMessage}</p>
      <p>{isInClient ? 'Running in LINE' : 'Running in browser'}</p>
      <button onClick={() => logout()}>ออกจากระบบ / Logout</button>
    </div>
  );
}
```

#### Return Type

| Property | Type | Description |
|----------|------|-------------|
| `isReady` | `boolean` | LIFF SDK successfully initialized |
| `isLoggedIn` | `boolean` | User is logged in via LINE |
| `isInClient` | `boolean` | Running inside the LINE client |
| `profile` | `LiffProfile \| null` | User profile (if logged in) |
| `error` | `Error \| null` | Initialization error (if any) |
| `login` | `(redirectUri?) => Promise<void>` | Trigger LINE login |
| `logout` | `() => Promise<void>` | Log out and reload |

---

### 3. Environment Configuration / การตั้งค่าสภาพแวดล้อม

The `configureSabai` / `getSabaiConfig` pair provides a runtime configuration singleton, solving the gap between `tsup` builds and `import.meta.env`.

```ts
import { configureSabai, getSabaiConfig } from '@sabai/core';

// Call once at app startup (e.g. in main.tsx)
configureSabai({
  liffId: import.meta.env.VITE_LIFF_ID || 'placeholder',
  mockMode: import.meta.env.DEV,
  appEnv: 'production',
});

// Later, anywhere in your app:
const config = getSabaiConfig();
console.log(config.liffId);   // '1234567890-abcdefgh'
console.log(config.mockMode); // false
console.log(config.appEnv);   // 'production'
```

#### `SabaiEnvConfig`

| Property | Type | Description |
|----------|------|-------------|
| `liffId` | `string` | LIFF ID from the LINE Developers Console |
| `mockMode` | `boolean` | Enable mock mode for local development |
| `appEnv` | `'development' \| 'staging' \| 'production'` | Application environment |

---

### 4. Internationalization (i18n) / การแปลภาษา

Sabai wraps [i18next](https://www.i18next.com/) + [react-i18next](https://react.i18next.com/) with LINE-aware language detection.

```ts
import { setupI18n } from '@sabai/core';

setupI18n({
  resources: {
    en: {
      translation: {
        greeting: 'Hello',
        welcome: 'Welcome to {{appName}}',
      },
    },
    th: {
      translation: {
        greeting: 'สวัสดี',
        welcome: 'ยินดีต้อนรับสู่ {{appName}}',
      },
    },
  },
});
```

Then use in React components:

```tsx
import { useTranslation } from 'react-i18next';

function Greeting() {
  const { t } = useTranslation();
  return <h1>{t('greeting')}</h1>;  // "สวัสดี" or "Hello"
}
```

#### Language Detection

`detectLineLanguage()` determines the user's language:

1. Checks `navigator.language` for `en` or `th`
2. Defaults to `th` (Thai) — the natural default for LINE Thailand apps

```ts
import { detectLineLanguage } from '@sabai/core';

const lang = detectLineLanguage(); // 'th' or 'en'
```

---

### 5. Messaging / การส่งข้อความ

#### Share Target Picker

Let users share messages with LINE friends:

```ts
import { shareMessage, buildOrderConfirmationFlex } from '@sabai/core';

// Share a text message
await shareMessage([{
  type: 'text',
  text: 'Check out this order!',
}]);

// Share an order confirmation Flex Message
const flex = buildOrderConfirmationFlex({
  orderId: 'ORD-001',
  items: [
    { name: 'Pad Thai', quantity: 2, price: 120 },
    { name: 'Tom Yum Goong', quantity: 1, price: 180 },
  ],
  total: 420,
  currency: '฿',
});

await shareMessage([flex]);
```

#### Push Messaging (Server-side)

Send messages from your backend using the LINE Messaging API:

```ts
import { sendServiceMessage } from '@sabai/core';

await sendServiceMessage('YOUR_CHANNEL_ACCESS_TOKEN', {
  to: 'USER_LINE_ID',
  messages: [
    buildOrderConfirmationFlex({
      orderId: 'ORD-001',
      items: [{ name: 'Pad Thai', quantity: 2, price: 120 }],
      total: 240,
    }),
  ],
});
```

> ⚠️ **Security:** Never expose your channel access token in client-side code. Use a backend proxy.

#### `buildOrderConfirmationFlex`

Generates a styled LINE Flex Message bubble with:
- Gold (#d4af37) header with "Order Confirmed ✓"
- Itemized body with quantities and prices
- Total footer with currency formatting

---

## TypeScript Types / ชนิดข้อมูล TypeScript

All types are fully exported for use in your application:

```ts
import type {
  SabaiConfig,
  LiffState,
  LiffProfile,
  SabaiEnvConfig,
  I18nConfig,
  ServiceMessageParams,
  FlexMessage,
  OrderConfirmation,
} from '@sabai/core';
```

### `LiffProfile`

```ts
interface LiffProfile {
  userId: string;        // Unique LINE user identifier
  displayName: string;   // User's display name on LINE
  pictureUrl?: string;   // Profile picture URL
  statusMessage?: string; // User's status message
}
```

### `SabaiConfig`

```ts
interface SabaiConfig {
  liffId: string;                                      // LIFF ID
  mockMode?: boolean;                                  // Enable mock mode
  appEnv?: 'development' | 'staging' | 'production';  // Environment
}
```

### `OrderConfirmation`

```ts
interface OrderConfirmation {
  orderId: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  currency?: string;  // Defaults to '฿'
}
```

---

## License / สัญญาอนุญาต

[MIT](../../LICENSE) © 2024–2026 Sabai Framework Contributors
