import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const CLI_PATH = join(__dirname, '..', 'dist', 'index.js');
const TEST_DIR = join(__dirname, '..', '.test-output');

/**
 * Helper to run the CLI as a subprocess.
 * Automatically answers "n" to the "install deps?" prompt via stdin.
 * The CLI resolves `projectName` relative to cwd, so we set cwd = TEST_DIR
 * and pass just the project name (not a full path).
 */
function runCli(args: string): string {
  return execSync(`echo "n" | node ${CLI_PATH} ${args}`, {
    encoding: 'utf-8',
    cwd: TEST_DIR,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
}

/**
 * Helper to count all files recursively in a directory.
 */
function countFiles(dir: string): number {
  let count = 0;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      count += countFiles(full);
    } else {
      count++;
    }
  }
  return count;
}

describe('create-sabai-app CLI', () => {
  beforeEach(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true });
    }
    mkdirSync(TEST_DIR, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true });
    }
  });

  // ─── Help & Version ─────────────────────────────────

  it('shows help with --help flag', () => {
    const output = execSync(`node ${CLI_PATH} --help`, { encoding: 'utf-8' });
    expect(output).toContain('create-sabai-app');
    expect(output).toContain('--template');
    expect(output).toContain('--liff-id');
    expect(output).toContain('blank');
    expect(output).toContain('e-commerce');
  });

  it('shows help with -h shorthand', () => {
    const output = execSync(`node ${CLI_PATH} -h`, { encoding: 'utf-8' });
    expect(output).toContain('create-sabai-app');
    expect(output).toContain('--template');
  });

  it('shows version with --version flag', () => {
    const output = execSync(`node ${CLI_PATH} --version`, { encoding: 'utf-8' });
    expect(output).toContain('create-sabai-app');
  });

  it('shows version with -v shorthand', () => {
    const output = execSync(`node ${CLI_PATH} -v`, { encoding: 'utf-8' });
    expect(output).toContain('create-sabai-app');
  });

  // ─── Blank Template ─────────────────────────────────

  describe('blank template', () => {
    it('creates a project with all expected files', () => {
      runCli('test-blank --template blank --liff-id test-liff-123');
      const projectDir = join(TEST_DIR, 'test-blank');

      // Core files
      expect(existsSync(join(projectDir, 'package.json'))).toBe(true);
      expect(existsSync(join(projectDir, 'src', 'App.tsx'))).toBe(true);
      expect(existsSync(join(projectDir, 'src', 'main.tsx'))).toBe(true);
      expect(existsSync(join(projectDir, 'vite.config.ts'))).toBe(true);
      expect(existsSync(join(projectDir, 'tsconfig.json'))).toBe(true);
      expect(existsSync(join(projectDir, 'tsconfig.node.json'))).toBe(true);
      expect(existsSync(join(projectDir, 'tailwind.config.js'))).toBe(true);
      expect(existsSync(join(projectDir, 'postcss.config.js'))).toBe(true);
      expect(existsSync(join(projectDir, 'index.html'))).toBe(true);
      expect(existsSync(join(projectDir, '.env.development'))).toBe(true);
      expect(existsSync(join(projectDir, '.gitignore'))).toBe(true);
    });

    it('replaces {{PROJECT_NAME}} placeholder in package.json', () => {
      runCli('my-cool-app --template blank --liff-id test-liff-123');
      const projectDir = join(TEST_DIR, 'my-cool-app');

      const packageJson = readFileSync(join(projectDir, 'package.json'), 'utf-8');
      expect(packageJson).toContain('"name": "my-cool-app"');
      expect(packageJson).not.toContain('{{PROJECT_NAME}}');
    });

    it('replaces {{LIFF_ID}} placeholder in .env.development', () => {
      runCli('test-liff --template blank --liff-id 1234567890-abcdefgh');
      const projectDir = join(TEST_DIR, 'test-liff');

      const envFile = readFileSync(join(projectDir, '.env.development'), 'utf-8');
      expect(envFile).toContain('VITE_LIFF_ID=1234567890-abcdefgh');
      expect(envFile).not.toContain('{{LIFF_ID}}');
    });

    it('strips .tmpl extension from package.json.tmpl', () => {
      runCli('test-tmpl --template blank --liff-id placeholder');
      const projectDir = join(TEST_DIR, 'test-tmpl');

      // Should have package.json, NOT package.json.tmpl
      expect(existsSync(join(projectDir, 'package.json'))).toBe(true);
      expect(existsSync(join(projectDir, 'package.json.tmpl'))).toBe(false);
    });

    it('generates valid JSON in package.json', () => {
      runCli('test-json --template blank --liff-id placeholder');
      const projectDir = join(TEST_DIR, 'test-json');

      const raw = readFileSync(join(projectDir, 'package.json'), 'utf-8');
      expect(() => JSON.parse(raw)).not.toThrow();

      const parsed = JSON.parse(raw);
      expect(parsed.name).toBe('test-json');
      expect(parsed.scripts).toBeDefined();
      expect(parsed.dependencies).toBeDefined();
    });
  });

  // ─── E-Commerce Template ────────────────────────────

  describe('e-commerce template', () => {
    it('creates a project with all expected files', () => {
      runCli('test-ecom --template e-commerce --liff-id ecom-liff-456');
      const projectDir = join(TEST_DIR, 'test-ecom');

      // Core files
      expect(existsSync(join(projectDir, 'package.json'))).toBe(true);
      expect(existsSync(join(projectDir, 'src', 'App.tsx'))).toBe(true);
      expect(existsSync(join(projectDir, 'src', 'main.tsx'))).toBe(true);
      expect(existsSync(join(projectDir, 'vite.config.ts'))).toBe(true);

      // E-commerce specific: pages
      expect(existsSync(join(projectDir, 'src', 'pages', 'HomePage.tsx'))).toBe(true);
      expect(existsSync(join(projectDir, 'src', 'pages', 'CartPage.tsx'))).toBe(true);
      expect(existsSync(join(projectDir, 'src', 'pages', 'CheckoutPage.tsx'))).toBe(true);
      expect(existsSync(join(projectDir, 'src', 'pages', 'ProductPage.tsx'))).toBe(true);
      expect(existsSync(join(projectDir, 'src', 'pages', 'SearchPage.tsx'))).toBe(true);
      expect(existsSync(join(projectDir, 'src', 'pages', 'ProfilePage.tsx'))).toBe(true);
      expect(existsSync(join(projectDir, 'src', 'pages', 'OrderConfirmationPage.tsx'))).toBe(true);

      // Stores
      expect(existsSync(join(projectDir, 'src', 'stores', 'cartStore.ts'))).toBe(true);
      expect(existsSync(join(projectDir, 'src', 'stores', 'appStore.ts'))).toBe(true);
      expect(existsSync(join(projectDir, 'src', 'stores', 'ordersStore.ts'))).toBe(true);

      // i18n
      expect(existsSync(join(projectDir, 'src', 'i18n', 'th.ts'))).toBe(true);
      expect(existsSync(join(projectDir, 'src', 'i18n', 'en.ts'))).toBe(true);
      expect(existsSync(join(projectDir, 'src', 'i18n', 'index.ts'))).toBe(true);

      // Components
      expect(existsSync(join(projectDir, 'src', 'components', 'ProductCard.tsx'))).toBe(true);
      expect(existsSync(join(projectDir, 'src', 'components', 'Layout.tsx'))).toBe(true);
      expect(existsSync(join(projectDir, 'src', 'components', 'BottomNav.tsx'))).toBe(true);

      // Data
      expect(existsSync(join(projectDir, 'src', 'data', 'products.ts'))).toBe(true);
    });

    it('replaces {{PROJECT_NAME}} in package.json', () => {
      runCli('my-shop --template e-commerce --liff-id ecom-liff-456');
      const projectDir = join(TEST_DIR, 'my-shop');

      const packageJson = readFileSync(join(projectDir, 'package.json'), 'utf-8');
      expect(packageJson).toContain('"name": "my-shop"');
      expect(packageJson).not.toContain('{{PROJECT_NAME}}');
    });

    it('replaces {{LIFF_ID}} in .env.development', () => {
      runCli('test-ecom-env --template e-commerce --liff-id ecom-liff-456');
      const projectDir = join(TEST_DIR, 'test-ecom-env');

      const envFile = readFileSync(join(projectDir, '.env.development'), 'utf-8');
      expect(envFile).toContain('VITE_LIFF_ID=ecom-liff-456');
      expect(envFile).not.toContain('{{LIFF_ID}}');
    });

    it('has more files than blank template', () => {
      runCli('cmp-blank --template blank --liff-id test');
      runCli('cmp-ecom --template e-commerce --liff-id test');

      const blankCount = countFiles(join(TEST_DIR, 'cmp-blank'));
      const ecomCount = countFiles(join(TEST_DIR, 'cmp-ecom'));

      expect(ecomCount).toBeGreaterThan(blankCount);
    });
  });

  // ─── Error Cases ────────────────────────────────────

  describe('error handling', () => {
    it('fails when target directory already exists', () => {
      // Create the directory first
      mkdirSync(join(TEST_DIR, 'test-dup'), { recursive: true });

      expect(() => {
        execSync(`node ${CLI_PATH} test-dup --template blank --liff-id test`, {
          encoding: 'utf-8',
          cwd: TEST_DIR,
          stdio: 'pipe',
        });
      }).toThrow();
    });

    it('fails on invalid template name', () => {
      expect(() => {
        execSync(`node ${CLI_PATH} test-invalid --template nonexistent --liff-id test`, {
          encoding: 'utf-8',
          cwd: TEST_DIR,
          stdio: 'pipe',
        });
      }).toThrow();
    });

    it('error message mentions the invalid template name', () => {
      try {
        execSync(`node ${CLI_PATH} test-bad-tmpl --template foobar --liff-id test`, {
          encoding: 'utf-8',
          cwd: TEST_DIR,
          stdio: 'pipe',
        });
        expect.unreachable('CLI should have thrown');
      } catch (error: unknown) {
        const err = error as { stderr?: string };
        expect(err.stderr).toContain('foobar');
      }
    });

    it('error message mentions the duplicate directory', () => {
      mkdirSync(join(TEST_DIR, 'test-exists'), { recursive: true });

      try {
        execSync(`node ${CLI_PATH} test-exists --template blank --liff-id test`, {
          encoding: 'utf-8',
          cwd: TEST_DIR,
          stdio: 'pipe',
        });
        expect.unreachable('CLI should have thrown');
      } catch (error: unknown) {
        const err = error as { stderr?: string };
        expect(err.stderr).toContain('already exists');
      }
    });
  });

  // ─── Skips Internal Directories ─────────────────────

  describe('directory filtering', () => {
    it('does not copy node_modules into the output', () => {
      runCli('test-no-nm --template blank --liff-id test');
      expect(existsSync(join(TEST_DIR, 'test-no-nm', 'node_modules'))).toBe(false);
    });

    it('does not copy .turbo into the output', () => {
      runCli('test-no-turbo --template blank --liff-id test');
      expect(existsSync(join(TEST_DIR, 'test-no-turbo', '.turbo'))).toBe(false);
    });

    it('does not copy dist into the output', () => {
      runCli('test-no-dist --template blank --liff-id test');
      expect(existsSync(join(TEST_DIR, 'test-no-dist', 'dist'))).toBe(false);
    });
  });
});
