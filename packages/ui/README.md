# @sabai/ui

> React components for Thai regulatory compliance — age verification, PDPA consent, and more.
>
> คอมโพเนนต์ React สำหรับการปฏิบัติตามกฎหมายไทย — ยืนยันอายุ, ความยินยอม PDPA และอื่นๆ

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)](https://react.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)

---

## Installation / การติดตั้ง

```bash
pnpm add @sabai/ui
```

**Peer dependencies:**

```bash
pnpm add react react-dom
```

---

## Features / คุณสมบัติ

- ✅ **Zero CSS dependency** — All styles are inline. No CSS imports, no class name conflicts.
- 🌙 **Premium dark theme** — Deep navy (#1a1a2e) with Sabai gold (#d4af37) accents
- 🇹🇭 **Bilingual** — All default text is Thai + English
- ♿ **Accessible** — ARIA roles, labels, and live regions
- 📱 **Mobile-first** — Designed for LINE Mini App viewport
- 🔒 **Compliance-ready** — Built for Thai alcohol law and PDPA requirements

---

## Component Gallery / แกลเลอรีคอมโพเนนต์

### 1. AgeVerification / การยืนยันอายุ

Full-screen age gate overlay with date-of-birth selection. Required under the **Thai Alcoholic Beverage Control Act B.E. 2551 (2008)** — minimum drinking age is **20 years** (not 21).

```tsx
import { AgeVerification } from '@sabai/ui';

function App() {
  const [verified, setVerified] = useState(false);

  if (!verified) {
    return (
      <AgeVerification
        minimumAge={20}
        onVerified={() => setVerified(true)}
      />
    );
  }

  return <div>Welcome to the app!</div>;
}
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `minimumAge` | `number` | `20` | Minimum age required (20 for Thai alcohol law) |
| `onVerified` | `() => void` | **required** | Callback when verification passes |
| `title` | `string` | `"กรุณายืนยันอายุ\nPlease verify your age"` | Title text |
| `subtitle` | `string` | `"คุณต้องมีอายุ {minimumAge} ปีขึ้นไป\nYou must be {minimumAge} years or older"` | Subtitle text |

#### Features

- 📅 Date-of-birth picker (day, month, year) with Thai month names
- 🔢 Accurate boundary-day age calculation
- 💾 Persists verification to `localStorage` (key: `sabai_age_verified`)
- 🚫 Shows bilingual error on underage attempts
- 🔒 Full-screen overlay with `z-index: 9999`

---

### 2. PdpaConsent / ความยินยอม PDPA

Bottom-sheet style overlay for collecting PDPA consent. Compliant with **Thailand's Personal Data Protection Act (PDPA) B.E. 2562 (2019)**.

```tsx
import { PdpaConsent } from '@sabai/ui';

function App() {
  const [consented, setConsented] = useState(false);

  if (!consented) {
    return (
      <PdpaConsent
        onAccept={(record) => {
          console.log('Consent record:', record);
          // record = { version: "1.0", timestamp: "...", consents: { ... } }
          setConsented(true);
        }}
      />
    );
  }

  return <div>App content</div>;
}
```

#### With Custom Consent Items

```tsx
<PdpaConsent
  version="2.0"
  title="นโยบายความเป็นส่วนตัว\nPrivacy Policy"
  items={[
    {
      id: 'data_collection',
      label: 'การเก็บรวบรวมข้อมูล / Data Collection',
      description: 'ยินยอมให้เก็บข้อมูลส่วนบุคคล / Consent to collect personal data',
      required: true,
    },
    {
      id: 'marketing',
      label: 'การตลาด / Marketing',
      description: 'ยินยอมรับข้อมูลโปรโมชั่น / Consent to marketing communications',
      required: false,
    },
  ]}
  onAccept={(record) => saveConsent(record)}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `PdpaConsentItem[]` | Thai defaults (3 items) | Consent items to display |
| `onAccept` | `(consents: PdpaConsentRecord) => void` | **required** | Callback with consent record |
| `title` | `string` | `"นโยบายความเป็นส่วนตัว\nPrivacy Policy"` | Title text |
| `version` | `string` | `"1.0"` | Version string for audit trail |

#### `PdpaConsentItem`

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | Unique identifier |
| `label` | `string` | Display label (bilingual recommended) |
| `description` | `string?` | Optional longer description |
| `required` | `boolean` | Whether this consent is required to proceed |

#### `PdpaConsentRecord` (returned on accept)

| Property | Type | Description |
|----------|------|-------------|
| `version` | `string` | Consent form version |
| `timestamp` | `string` | ISO 8601 timestamp |
| `consents` | `Record<string, boolean>` | Map of consent item IDs to accepted/rejected |

#### PDPA Compliance Features

- ☑️ **No pre-checked checkboxes** — PDPA §19 requires explicit consent
- ⭐ **Required vs optional items** — Required items marked with red asterisk
- 🕐 **Timestamped records** — ISO 8601 audit trail
- 📋 **Version tracking** — For consent form updates
- 💾 **localStorage persistence** — Key: `sabai_pdpa_consent`
- 🔒 **Accept button disabled** until all required items are checked

---

### 3. Loading / การโหลด

Full-screen loading overlay with animated spinner.

```tsx
import { Loading } from '@sabai/ui';

function App() {
  if (isLoading) {
    return <Loading message="กำลังตรวจสอบ...\nVerifying..." />;
  }

  return <div>Content loaded!</div>;
}
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `message` | `string` | `"กำลังโหลด...\nLoading..."` | Loading message (supports `\n` for line breaks) |

#### Features

- 🔄 CSS keyframe animation (injected via `<style>` tag)
- ♿ `role="status"` and `aria-live="polite"` for screen readers
- 🌙 Dark theme with gold (#d4af37) spinner accent

---

### 4. ErrorDisplay / แสดงข้อผิดพลาด

Full-screen error display with optional retry button.

```tsx
import { ErrorDisplay } from '@sabai/ui';

function App() {
  if (error) {
    return (
      <ErrorDisplay
        title="เกิดข้อผิดพลาด / Something went wrong"
        message={error.message}
        onRetry={() => window.location.reload()}
        retryLabel="ลองอีกครั้ง / Try Again"
      />
    );
  }

  return <div>App content</div>;
}
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `"เกิดข้อผิดพลาด / Something went wrong"` | Error title |
| `message` | `string` | **required** | Error message to display |
| `onRetry` | `() => void` | `undefined` | Retry callback (shows button when provided) |
| `retryLabel` | `string` | `"ลองอีกครั้ง / Try Again"` | Retry button text |

---

### 5. ErrorBoundary / ขอบเขตข้อผิดพลาด

React error boundary that catches render errors and shows a fallback UI. Uses `ErrorDisplay` as its default fallback.

```tsx
import { ErrorBoundary } from '@sabai/ui';

function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Send to error tracking service
        logError(error, errorInfo);
      }}
    >
      <MyApp />
    </ErrorBoundary>
  );
}
```

#### With Custom Fallback

```tsx
<ErrorBoundary
  fallback={<div>Something broke. Please refresh the page.</div>}
>
  <MyApp />
</ErrorBoundary>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | **required** | Child components to wrap |
| `fallback` | `ReactNode` | `ErrorDisplay` with retry | Custom fallback UI |
| `onError` | `(error: Error, errorInfo: ErrorInfo) => void` | `undefined` | Error callback |

#### Features

- 🔄 Built-in retry mechanism (resets error state)
- 📊 Error callback for logging/tracking
- 🎨 Defaults to `ErrorDisplay` with bilingual messaging

---

## Styling / การจัดสไตล์

All components use **inline styles only**. There are no CSS files, CSS modules, or Tailwind classes.

**Why?**

1. **Zero configuration** — Works in any React project without build config changes
2. **No CSS conflicts** — Inline styles have the highest specificity
3. **Bundle friendly** — No separate CSS file to import or tree-shake
4. **LINE Mini App optimized** — Minimal payload for mobile webviews

### Design System

| Token | Value | Usage |
|-------|-------|-------|
| Background (primary) | `#1a1a2e` | Overlay backgrounds |
| Background (card) | `#16213e` | Card/sheet backgrounds |
| Accent (gold) | `#d4af37` | Buttons, spinner, highlights |
| Text (primary) | `#ffffff` | Headings |
| Text (secondary) | `#8892b0` | Descriptions, subtitles |
| Border | `#2a2a4a` | Dividers, input borders |
| Error | `#e74c3c` | Error messages, required asterisks |

---

## Thai Compliance Notes / หมายเหตุการปฏิบัติตามกฎหมายไทย

### 🍺 Thai Alcohol Law

The **Alcoholic Beverage Control Act B.E. 2551 (2008)** requires:

- Age verification before viewing or purchasing alcoholic beverages
- **Minimum age: 20 years** (not 21 as in some other countries)
- Sale time restrictions: 11:00–14:00 and 17:00–24:00 only

The `AgeVerification` component handles the age gate requirement. Time-based restrictions should be implemented in your business logic.

### 🔒 PDPA (Thai Data Privacy Law)

The **Personal Data Protection Act B.E. 2562 (2019)** requires:

- **Explicit consent** before collecting personal data
- **No pre-checked boxes** — consent must be affirmative
- **Clear purpose** — each data use must be explained
- **Withdrawal mechanism** — users can revoke consent
- **Audit trail** — records of when and what was consented

The `PdpaConsent` component implements consent collection with audit-ready records. Penalties for non-compliance can reach **5 million THB** per violation.

---

## Full TypeScript Types / ชนิดข้อมูล TypeScript

```ts
import type {
  AgeVerificationProps,
  PdpaConsentProps,
  PdpaConsentItem,
  PdpaConsentRecord,
  LoadingProps,
  ErrorDisplayProps,
  ErrorBoundaryProps,
} from '@sabai/ui';
```

---

## License / สัญญาอนุญาต

[MIT](../../LICENSE) © 2024–2026 Sabai Framework Contributors
