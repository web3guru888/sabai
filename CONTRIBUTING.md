# Contributing to Sabai Framework / การมีส่วนร่วมกับ Sabai Framework

Thank you for your interest in contributing to Sabai! 🌴

ขอบคุณที่สนใจร่วมพัฒนา Sabai Framework!

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Branch Naming](#branch-naming)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)
- [Testing](#testing)
- [Documentation](#documentation)

---

## Code of Conduct

Be respectful and constructive. We follow the [Contributor Covenant](https://www.contributor-covenant.org/). Treat everyone with kindness. สุภาพและสร้างสรรค์ 🙏

---

## How to Contribute

### 🐛 Report Bugs

1. Search [existing issues](https://github.com/web3guru888/sabai/issues) first
2. Create a new issue with:
   - Clear title
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (Node.js version, OS, browser)

### 💡 Request Features

1. Open an issue with the `enhancement` label
2. Describe the use case and proposed solution
3. Discuss before starting implementation

### 🔧 Submit Code

1. Fork the repository
2. Create a feature branch
3. Write code + tests
4. Open a Pull Request

---

## Development Setup

### Prerequisites

- **Node.js** ≥ 18
- **pnpm** ≥ 9 (`npm install -g pnpm`)
- **Git**

### Getting Started

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/sabai.git
cd sabai

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Run linter
pnpm lint

# Start dev servers
pnpm dev
```

### Workspace Structure

```
sabai/
├── packages/core/       # @sabai/core
├── packages/ui/         # @sabai/ui
├── packages/payments/   # @sabai/payments
├── packages/cli/        # create-sabai-app
└── apps/e-commerce/     # SipSabai reference app
```

---

## Branch Naming

Use prefixes to categorize your branch:

| Prefix | Usage | Example |
|--------|-------|---------|
| `feature/` | New features | `feature/add-promptpay-webhook` |
| `fix/` | Bug fixes | `fix/age-calculation-edge-case` |
| `docs/` | Documentation | `docs/update-deployment-guide` |
| `refactor/` | Code refactoring | `refactor/simplify-liff-init` |
| `test/` | Test additions/fixes | `test/add-omise-integration-tests` |
| `chore/` | Maintenance tasks | `chore/update-dependencies` |
| `ci/` | CI/CD changes | `ci/add-github-actions` |

Always branch from `main`:

```bash
git checkout main
git pull origin main
git checkout -b feature/my-feature
```

---

## Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Code style (formatting, no logic change) |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Performance improvement |
| `test` | Adding or modifying tests |
| `chore` | Build, CI, or auxiliary tool changes |

### Scopes

| Scope | Package |
|-------|---------|
| `core` | `@sabai/core` |
| `ui` | `@sabai/ui` |
| `payments` | `@sabai/payments` |
| `cli` | `create-sabai-app` |
| `e-commerce` | SipSabai reference app |
| `docs` | Documentation |
| `ci` | CI/CD pipelines |

### Examples

```
feat(core): add session persistence to useLiff hook
fix(ui): correct age calculation for leap year birthdays
docs(payments): add PromptPay webhook example
test(core): add retry timeout edge case tests
chore: bump TypeScript to 5.9
```

---

## Pull Request Process

### 1. Before Opening a PR

- [ ] Code builds: `pnpm build`
- [ ] Tests pass: `pnpm test`
- [ ] Linter passes: `pnpm lint`
- [ ] New features have tests
- [ ] Documentation updated if needed

### 2. PR Template

When opening a PR, include:

```markdown
## What

Brief description of the change.

## Why

Motivation and context.

## How

Technical approach.

## Testing

How was this tested?

## Checklist

- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] `pnpm build` passes
- [ ] `pnpm test` passes
- [ ] `pnpm lint` passes
```

### 3. Review Process

1. All PRs require at least one review
2. CI checks must pass (build, test, lint)
3. Keep PRs focused — one feature or fix per PR
4. Respond to review feedback promptly
5. Squash commits when merging

---

## Code Style

### TypeScript

- **Strict mode** enabled
- **ESLint** with TypeScript plugin
- **Prettier** for formatting
- No `any` types (use `unknown` and narrow)
- Prefer `interface` over `type` for objects
- Export types separately: `export type { ... }`

### React

- **Function components** only (no class components except ErrorBoundary)
- **Hooks** for state and effects
- **Named exports** (no default exports for components)
- **Inline styles** in `@sabai/ui` (no CSS imports)

### Naming Conventions

| Entity | Convention | Example |
|--------|-----------|---------|
| Files (components) | PascalCase | `AgeVerification.tsx` |
| Files (utilities) | camelCase | `messaging.ts` |
| Components | PascalCase | `AgeVerification` |
| Hooks | camelCase with `use` prefix | `useLiff` |
| Functions | camelCase | `initLiff` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRIES` |
| Types/Interfaces | PascalCase | `SabaiConfig` |
| Test files | `*.test.ts` / `*.test.tsx` | `liff.test.ts` |

### File Organization

```
packages/core/
├── src/
│   ├── index.ts        # Public API (re-exports)
│   ├── liff.ts         # Feature module
│   ├── hooks.ts        # React hooks
│   └── types.ts        # TypeScript types
├── __tests__/
│   └── liff.test.ts    # Tests mirror src/ structure
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── vitest.config.ts
```

---

## Testing

### Requirements

- All new features must have tests
- All bug fixes should include a regression test
- Aim for meaningful coverage (not just line coverage)

### Test Structure

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('featureName', () => {
  beforeEach(() => {
    // Reset state
  });

  it('should do expected thing', () => {
    // Arrange
    // Act
    // Assert
    expect(result).toBe(expected);
  });

  it('should handle edge case', () => {
    // ...
  });
});
```

### Running Tests

```bash
# All tests
pnpm test

# Specific package
cd packages/core && pnpm test

# Watch mode
pnpm test:watch

# With coverage
pnpm test -- --coverage
```

### Testing Tools

| Tool | Usage |
|------|-------|
| **Vitest** | Test runner |
| **@testing-library/react** | React component testing |
| **@testing-library/user-event** | User interaction simulation |
| **jsdom** | Browser environment simulation |
| **vi.mock()** | Module mocking |

---

## Documentation

### When to Update Docs

- Adding a new exported function/component/type
- Changing an existing API
- Adding a new package or feature
- Fixing incorrect documentation

### Documentation Style

- **Bilingual** — English primary, Thai for key terms
- **Code examples** — Must compile and be copy-pastable
- **Tables** — For API references and props
- **Mermaid diagrams** — For architecture and flows
- TSDoc comments on all public exports

### TSDoc Example

```ts
/**
 * Initialize the LIFF SDK with automatic retry and deduplication.
 *
 * @param config - Sabai/LIFF configuration including the LIFF ID.
 * @returns A promise resolving to the current {@link LiffState}.
 *
 * @example
 * ```ts
 * const state = await initLiff({ liffId: '1234567890-abcdefgh' });
 * ```
 */
export async function initLiff(config: SabaiConfig): Promise<LiffState> {
```

---

## Questions?

Open an issue or start a discussion on GitHub. We're happy to help!

มีคำถาม? เปิด issue หรือเริ่มการสนทนาบน GitHub ยินดีช่วยเหลือครับ/ค่ะ!

🌴 สบาย~
