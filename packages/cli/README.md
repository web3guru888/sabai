# create-sabai-app

> CLI scaffolding tool for Sabai LINE Mini App projects.
>
> เครื่องมือ CLI สำหรับสร้างโปรเจกต์ LINE Mini App ด้วย Sabai

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)

---

## Usage / การใช้งาน

```bash
npx create-sabai-app my-app
```

Or with all options:

```bash
npx create-sabai-app my-app --template blank --liff-id 1234567890-abcdefgh
```

---

## Interactive Mode / โหมดโต้ตอบ

Run without arguments for guided prompts:

```bash
$ npx create-sabai-app

🌴 create-sabai-app — สร้าง LINE Mini App อย่างสบาย

📁 Project name: my-shop
📦 Template (blank, e-commerce) [blank]: e-commerce
🔑 LIFF ID (or "placeholder" for mock mode) [placeholder]: placeholder

📁 Creating "my-shop" with "e-commerce" template...

   ✅ Created 24 files

📦 Install dependencies with pnpm? (Y/n): Y

📦 Installing dependencies with pnpm...

   ✅ Dependencies installed

✅ Project created successfully!

  Next steps:

  cd my-shop
  pnpm dev

  💡 Tip: Running in mock mode. Update .env.development
     with your real LIFF ID when ready.

🌴 Happy building! สบาย~
```

---

## Command Line Options / ตัวเลือกบรรทัดคำสั่ง

| Option | Description | Default |
|--------|-------------|---------|
| `<project-name>` | Name of the project directory | *(prompted)* |
| `--template <name>` | Template to use: `blank` or `e-commerce` | `blank` |
| `--liff-id <id>` | LINE LIFF ID | `placeholder` |
| `--help`, `-h` | Show help message | — |
| `--version`, `-v` | Show version | — |

---

## Templates / เทมเพลต

### `blank` — Minimal LIFF App

A minimal starting point with:

- ⚡ Vite + React + TypeScript
- 🟢 LIFF SDK integration via `@sabai/core`
- 🎨 Tailwind CSS pre-configured
- 🏗️ Clean project structure
- 🧪 Vitest testing setup
- 📝 Pre-configured `.env.development` with mock mode

**Best for:** Developers who want a clean slate with LIFF already wired up.

```bash
npx create-sabai-app my-app --template blank
```

### `e-commerce` — Full E-commerce App

A complete LINE Mini App e-commerce experience based on **SipSabai**:

- 🛒 Full shopping cart with Zustand state management
- 🍺 Age verification gate (Thai alcohol law)
- 🔒 PDPA consent collection
- 🌏 Thai/English i18n
- 📱 Bottom navigation, product pages, checkout flow
- 🎨 Premium dark theme with Sabai gold accents

**Best for:** Quickly launching a Thai e-commerce LINE Mini App.

```bash
npx create-sabai-app my-shop --template e-commerce
```

---

## Example Workflow / ขั้นตอนการทำงาน

### 1. Create the project

```bash
npx create-sabai-app sipsabai --template e-commerce --liff-id placeholder
```

### 2. Start development

```bash
cd sipsabai
pnpm dev
```

The app runs at `http://localhost:5173` with mock mode (no LINE account needed).

### 3. Configure your LIFF ID

When ready to connect to LINE:

1. Go to the [LINE Developers Console](https://developers.line.biz/)
2. Create a LINE Login channel
3. Add a LIFF app (size: Full)
4. Set the Endpoint URL to your deployment URL
5. Copy the LIFF ID

Update `.env.development`:

```env
VITE_LIFF_ID=1234567890-abcdefgh
VITE_MOCK_MODE=false
```

### 4. Deploy

```bash
pnpm build
# Deploy the dist/ folder to your hosting provider
```

---

## Placeholder Replacement / การแทนที่ตัวแปร

The CLI replaces these placeholders in template files:

| Placeholder | Replaced with |
|-------------|---------------|
| `{{PROJECT_NAME}}` | The project name |
| `{{LIFF_ID}}` | The LIFF ID |

---

## Package Manager Detection / การตรวจจับ Package Manager

The CLI auto-detects your preferred package manager:

1. **pnpm** — checked first
2. **yarn** — checked second
3. **npm** — fallback

---

## License / สัญญาอนุญาต

[MIT](../../LICENSE) © 2024–2026 Sabai Framework Contributors
