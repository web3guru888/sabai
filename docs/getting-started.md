# Getting Started / เริ่มต้นใช้งาน

This guide walks you through creating your first LINE Mini App with the Sabai Framework.

คู่มือนี้จะพาคุณสร้าง LINE Mini App แรกด้วย Sabai Framework

---

## Prerequisites / สิ่งที่ต้องมี

| Requirement | Version | How to install |
|-------------|---------|----------------|
| **Node.js** | ≥ 18 | [nodejs.org](https://nodejs.org/) |
| **pnpm** | ≥ 9 | `npm install -g pnpm` |
| **LINE Developer Account** | — | [developers.line.biz](https://developers.line.biz/) |

---

## Step 1: Create a Project / สร้างโปรเจกต์

```bash
npx create-sabai-app my-line-app --template blank --liff-id placeholder
cd my-line-app
```

The CLI will:
1. Scaffold a new project from the selected template
2. Replace placeholders with your project name and LIFF ID
3. Optionally install dependencies

> 💡 Use `--template e-commerce` for a full shopping app with cart, checkout, and compliance gates.

---

## Step 2: Configure LIFF / ตั้งค่า LIFF

### 2a. Create a LINE Login Channel

1. Go to the [LINE Developers Console](https://developers.line.biz/)
2. Create a new **Provider** (or use an existing one)
3. Create a new **LINE Login** channel
4. Note your **Channel ID** and **Channel Secret**

### 2b. Create a LIFF App

1. In your LINE Login channel, go to the **LIFF** tab
2. Click **Add** to create a new LIFF app
3. Set these values:

| Setting | Value |
|---------|-------|
| **Size** | `Full` (recommended for Mini Apps) |
| **Endpoint URL** | Your deployment URL (e.g. `https://my-app.pages.dev`) |
| **Scope** | `profile`, `openid` |
| **Bot link feature** | `On (Aggressive)` if you need messaging |

4. Copy the **LIFF ID** (format: `1234567890-abcdefgh`)

### 2c. Update Your Project

Edit `.env.development`:

```env
VITE_LIFF_ID=1234567890-abcdefgh
VITE_MOCK_MODE=false
```

For production, create `.env.production`:

```env
VITE_LIFF_ID=1234567890-abcdefgh
VITE_MOCK_MODE=false
```

---

## Step 3: Development with Mock Mode / พัฒนาด้วยโหมดจำลอง

Mock mode lets you develop locally without a real LINE account:

```bash
pnpm dev
```

Open `http://localhost:5173` in your browser. With mock mode enabled:

- ✅ LIFF SDK initializes with simulated data
- ✅ `isLoggedIn` returns `true`
- ✅ `profile` returns a mock user profile
- ✅ No LINE login screen is shown
- ❌ Share Target Picker and real messaging won't work

### Using Mock Mode in Code

```tsx
import { useLiff } from '@sabai/core';

function App() {
  const { isReady, isLoggedIn, profile } = useLiff({
    liffId: import.meta.env.VITE_LIFF_ID || 'placeholder',
    mockMode: import.meta.env.VITE_MOCK_MODE === 'true',
  });

  // In mock mode: isReady = true, isLoggedIn = true,
  // profile = { userId: '...', displayName: 'Mock User', ... }
}
```

> 💡 **Tip:** Set `VITE_MOCK_MODE=true` in `.env.development` and `VITE_MOCK_MODE=false` in `.env.production`.

---

## Step 4: Add Thai Compliance Gates / เพิ่มด่านตรวจสอบตามกฎหมายไทย

If your app sells alcohol or collects personal data, add the compliance gates:

```tsx
import { useState } from 'react';
import { useLiff } from '@sabai/core';
import { Loading, AgeVerification, PdpaConsent, ErrorBoundary } from '@sabai/ui';

function App() {
  const [ageVerified, setAgeVerified] = useState(false);
  const [pdpaConsented, setPdpaConsented] = useState(false);

  const { isReady, error } = useLiff({
    liffId: import.meta.env.VITE_LIFF_ID,
    mockMode: import.meta.env.VITE_MOCK_MODE === 'true',
  });

  if (!isReady) return <Loading />;
  if (error) return <div>Error: {error.message}</div>;

  // Age verification (required for alcohol-related apps)
  if (!ageVerified) {
    return <AgeVerification onVerified={() => setAgeVerified(true)} />;
  }

  // PDPA consent (required for personal data collection)
  if (!pdpaConsented) {
    return <PdpaConsent onAccept={() => setPdpaConsented(true)} />;
  }

  return (
    <ErrorBoundary>
      <div>
        <h1>สวัสดี! Your app is ready.</h1>
      </div>
    </ErrorBoundary>
  );
}
```

---

## Step 5: Add Payments (optional) / เพิ่มระบบชำระเงิน

### PromptPay QR (simplest option)

```tsx
import { generatePromptPayQR } from '@sabai/payments';

function PaymentPage() {
  const [qr, setQr] = useState<string | null>(null);

  const handlePay = async () => {
    const { qrDataUrl } = await generatePromptPayQR({
      target: '0812345678',
      amount: 350,
    });
    setQr(qrDataUrl);
  };

  return (
    <div>
      <button onClick={handlePay}>Generate QR</button>
      {qr && <img src={qr} alt="PromptPay QR" />}
    </div>
  );
}
```

### LINE Pay (requires server-side)

See the [payments package documentation](../packages/payments/README.md) for LINE Pay and Omise setup.

---

## Step 6: Deploy to Production / ปรับใช้ในโปรดักชัน

```bash
# Build for production
pnpm build

# The built files are in dist/
```

Deploy the `dist/` folder to any static hosting provider. See the [Deployment Guide](./deployment.md) for detailed instructions for:

- Cloudflare Pages
- Vercel
- AWS (S3 + CloudFront)

After deployment, update the LIFF app's **Endpoint URL** in the LINE Developers Console to your production URL.

---

## Next Steps / ขั้นตอนถัดไป

- 📖 [Architecture Guide](./architecture.md) — Understand the monorepo structure
- 🇹🇭 [Thai Compliance Guide](./thai-compliance.md) — Age verification, PDPA, and more
- 🚀 [Deployment Guide](./deployment.md) — Deploy to production
- 💳 [Payments Guide](../packages/payments/README.md) — Integrate LINE Pay, PromptPay, Omise
