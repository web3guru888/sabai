# Deployment Guide / คู่มือการปรับใช้

Deploy your Sabai LINE Mini App to production. This guide covers Cloudflare Pages, Vercel, and AWS.

ปรับใช้ LINE Mini App ของคุณสู่โปรดักชัน คู่มือนี้ครอบคลุม Cloudflare Pages, Vercel และ AWS

---

## Prerequisites / สิ่งที่ต้องมี

Before deploying:

1. ✅ Your app builds successfully: `pnpm build`
2. ✅ You have a LIFF ID from the [LINE Developers Console](https://developers.line.biz/)
3. ✅ Your production environment variables are configured

---

## Environment Variables / ตัวแปรสภาพแวดล้อม

| Variable | Required | Description |
|----------|:--------:|-------------|
| `VITE_LIFF_ID` | ✅ | Your LIFF ID from LINE Developers Console |
| `VITE_MOCK_MODE` | — | Set to `false` in production (default) |
| `LINEPAY_CHANNEL_ID` | 💳 | LINE Pay channel ID (server-side only) |
| `LINEPAY_CHANNEL_SECRET` | 💳 | LINE Pay channel secret (server-side only) |
| `OMISE_PUBLIC_KEY` | 💳 | Omise public key (client-safe) |
| `OMISE_SECRET_KEY` | 💳 | Omise secret key (server-side only) |

> 💳 = Required only if using that payment method

---

## Build / สร้าง

```bash
# Build the production bundle
pnpm build

# The output is in dist/
ls dist/
```

The build produces a static site (HTML + JS + CSS) that can be deployed to any static hosting provider.

---

## Option 1: Cloudflare Pages (Recommended) / แนะนำ

Cloudflare Pages offers free hosting with global CDN, automatic HTTPS, and excellent performance in Southeast Asia.

### Via Dashboard

1. Push your code to GitHub
2. Go to [Cloudflare Pages](https://pages.cloudflare.com/)
3. Click **Create a project** → **Connect to Git**
4. Select your repository
5. Configure build settings:

| Setting | Value |
|---------|-------|
| **Build command** | `pnpm build` |
| **Build output directory** | `dist` |
| **Root directory** | `/` (or `apps/e-commerce` for monorepo) |
| **Node.js version** | `18` |

6. Add environment variables:
   - `VITE_LIFF_ID` = your LIFF ID
   - `VITE_MOCK_MODE` = `false`

7. Click **Save and Deploy**

### Via Wrangler CLI

```bash
# Install Wrangler
pnpm add -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
pnpm build
wrangler pages deploy dist --project-name=my-line-app
```

### SPA Routing

Create `public/_redirects` for single-page app routing:

```
/*  /index.html  200
```

Or `public/_headers` for security headers:

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
```

---

## Option 2: Vercel

### Via Dashboard

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com/) → **New Project**
3. Import your repository
4. Configure:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Build Command** | `pnpm build` |
| **Output Directory** | `dist` |
| **Install Command** | `pnpm install` |

5. Add environment variables in the Vercel dashboard
6. Deploy

### Via CLI

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
pnpm build
vercel --prod
```

### SPA Configuration

Create `vercel.json` in your project root:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## Option 3: AWS (S3 + CloudFront)

For enterprise deployments with full control.

### Step 1: Create S3 Bucket

```bash
aws s3 mb s3://my-line-app --region ap-southeast-1
```

### Step 2: Upload Build

```bash
pnpm build
aws s3 sync dist/ s3://my-line-app --delete
```

### Step 3: Create CloudFront Distribution

```bash
aws cloudfront create-distribution \
  --origin-domain-name my-line-app.s3.ap-southeast-1.amazonaws.com \
  --default-root-object index.html
```

### Step 4: Configure SPA Routing

In CloudFront, create a custom error response:

| HTTP Error Code | Response Page Path | HTTP Response Code |
|:---------------:|-------------------:|:------------------:|
| 403 | `/index.html` | 200 |
| 404 | `/index.html` | 200 |

### Step 5: Add Custom Domain + HTTPS

1. Request an ACM certificate for your domain
2. Add the custom domain to CloudFront
3. Point your DNS to CloudFront

### Recommended AWS Region

For LINE Mini Apps targeting Thailand, use **ap-southeast-1 (Singapore)** for lowest latency to Thai users.

---

## LINE Developer Console Setup / ตั้งค่า LINE Developer Console

After deployment, configure your LIFF app to point to your production URL.

### Step 1: Update LIFF Endpoint URL

1. Go to [LINE Developers Console](https://developers.line.biz/)
2. Select your channel → **LIFF** tab
3. Edit your LIFF app
4. Set **Endpoint URL** to your production URL:
   - Cloudflare: `https://my-app.pages.dev`
   - Vercel: `https://my-app.vercel.app`
   - AWS: `https://my-app.example.com`

### Step 2: Verify LIFF Configuration

| Setting | Recommended Value |
|---------|------------------|
| **Size** | Full |
| **Endpoint URL** | Your production URL (HTTPS required) |
| **Scope** | `profile`, `openid` |
| **Bot link feature** | On (Aggressive) — if using messaging |
| **Module mode** | Off (unless embedding in chat) |

### Step 3: Add to LINE Official Account

1. Go to your LINE Official Account → **Rich Menu**
2. Add a button that opens your LIFF URL: `https://liff.line.me/{LIFF_ID}`

---

## Production Checklist / รายการตรวจสอบโปรดักชัน

Before going live:

- [ ] `VITE_MOCK_MODE` is `false` (or not set)
- [ ] `VITE_LIFF_ID` is your real LIFF ID
- [ ] LIFF Endpoint URL points to production
- [ ] HTTPS is enabled (required by LIFF)
- [ ] Age verification gate is working (if applicable)
- [ ] PDPA consent is collecting records
- [ ] Payment methods tested with sandbox → switched to production keys
- [ ] Error tracking is set up (Sentry, LogRocket, etc.)
- [ ] Performance tested on mobile devices
- [ ] Tested inside the LINE app (not just browser)

---

## Performance Tips / เคล็ดลับประสิทธิภาพ

LINE Mini Apps run as webviews on mobile devices. Performance is critical.

| Tip | Why |
|-----|-----|
| **Use a CDN close to Thailand** | Cloudflare, Vercel, or AWS Singapore |
| **Enable compression** | Gzip/Brotli for JS and CSS |
| **Lazy load images** | Use `loading="lazy"` on `<img>` tags |
| **Minimize bundle size** | Tree-shake unused exports |
| **Use `useLiff` deduplication** | Prevents double LIFF init in StrictMode |
| **Cache LIFF SDK** | `@line/liff` is ~50KB — ensure it's cached |

---

## Troubleshooting / การแก้ไขปัญหา

| Issue | Solution |
|-------|----------|
| **LIFF init fails** | Verify LIFF ID and Endpoint URL match. Check HTTPS. |
| **Blank screen in LINE** | Check browser console for errors. Ensure JS builds correctly. |
| **403 on direct URL access** | Configure SPA routing (all paths → `index.html`). |
| **Mock mode in production** | Ensure `VITE_MOCK_MODE` is `false`. |
| **Payment fails** | Verify production API keys. Check server-side logs. |

---

## Next Steps / ขั้นตอนถัดไป

- [Getting Started](./getting-started.md) — Initial setup guide
- [Thai Compliance](./thai-compliance.md) — Legal requirements
- [Architecture](./architecture.md) — How the framework is structured
