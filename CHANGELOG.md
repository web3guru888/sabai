# Changelog

All notable changes to the Sabai Framework will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-03-20

### Added

#### @sabai/core
- LIFF SDK initialization with automatic retry (exponential backoff) and deduplication
- `useLiff` React hook for reactive LIFF state management
- Environment configuration singleton (`configureSabai` / `getSabaiConfig`)
- i18n setup with i18next, react-i18next, and LINE language auto-detection
- LINE messaging utilities: Share Target Picker, push messages, Flex Message builders
- `buildOrderConfirmationFlex` for styled order confirmation messages
- Mock mode support via `@line/liff-mock` for local development
- Full TypeScript type definitions for all public APIs

#### @sabai/ui
- `AgeVerification` — Full-screen age gate for Thai alcohol law compliance (minimum age 20)
- `PdpaConsent` — Bottom-sheet PDPA consent form with audit-ready records
- `Loading` — Full-screen loading overlay with animated spinner
- `ErrorDisplay` — Error screen with optional retry action
- `ErrorBoundary` — React error boundary with fallback UI
- Zero-dependency inline styles with premium dark theme
- Bilingual Thai/English default text on all components
- ARIA accessibility attributes on all components
- localStorage persistence for age verification and PDPA consent

#### @sabai/payments
- `LinePayClient` — LINE Pay v3 API client with HMAC-SHA256 signing
  - Reserve, confirm, and query payment lifecycle
  - Sandbox and production environment support
- `generatePromptPayQR` — EMVCo-compliant PromptPay QR code generation
- `generatePromptPayPayload` — Raw PromptPay TLV payload generation
- `OmiseClient` — Omise/Opn payment gateway client
  - Create and retrieve charges
  - Client-safe public key access
- Utility functions: CRC16, TLV encoding, phone formatting, national ID validation
- Full TypeScript type definitions for all payment providers

#### create-sabai-app
- Interactive CLI scaffolding tool
- `blank` template — Minimal Vite + React + TypeScript + LIFF
- `e-commerce` template — Full SipSabai shopping experience
- Placeholder replacement for project name and LIFF ID
- Package manager auto-detection (pnpm, yarn, npm)
- Binary file handling for images and fonts

#### SipSabai (Reference E-commerce App)
- Complete LINE Mini App e-commerce experience
- Product catalogue with category filtering and search
- Shopping cart with Zustand state management
- Checkout flow with time slot picker
- Order confirmation with Flex Message sharing
- Age verification and PDPA consent gates
- Thai/English i18n with LINE language detection
- Premium dark theme with bottom navigation
- Profile page with LINE user data

#### Infrastructure
- Turborepo monorepo with pnpm workspaces
- tsup bundling for ESM + CJS + DTS output
- Vitest test suite across all packages
- ESLint + Prettier code quality tooling
- Shared TypeScript base configuration
- Comprehensive documentation (README, API docs, guides)
