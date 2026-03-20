/**
 * create-sabai-app — CLI scaffolding tool for Sabai LINE Mini App projects
 *
 * Creates a new Sabai project from a template with LIFF configuration.
 *
 * @example
 * ```bash
 * npx create-sabai-app my-app --template blank --liff-id YOUR_LIFF_ID
 * npx create-sabai-app my-shop --template e-commerce --liff-id 1234567890-abcdefgh
 * ```
 */

import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  readdirSync,
  statSync,
} from 'node:fs';
import { join, dirname, resolve, extname } from 'node:path';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** Available project templates */
const TEMPLATES = ['blank', 'e-commerce'] as const;
type TemplateName = (typeof TEMPLATES)[number];

/** CLI option values parsed from command-line arguments */
interface CliOptions {
  projectName: string;
  template: TemplateName;
  liffId: string;
}

/** File extensions treated as binary (copied without placeholder replacement) */
const BINARY_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.svg',
  '.woff', '.woff2', '.ttf', '.eot', '.otf',
  '.zip', '.tar', '.gz',
  '.mp3', '.mp4', '.wav', '.ogg',
  '.pdf',
]);

/**
 * Prompt the user for input via readline.
 * @param question - The prompt text to display
 * @returns The trimmed user input
 */
async function prompt(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((res) => {
    rl.question(question, (answer) => {
      rl.close();
      res(answer.trim());
    });
  });
}

/**
 * Parse command-line arguments into partial CLI options.
 *
 * Supports:
 * - Positional first argument as project name
 * - `--template <name>` flag
 * - `--liff-id <id>` flag
 * - `--help` / `-h` flag
 * - `--version` / `-v` flag
 */
function parseArgs(): Partial<CliOptions> & { help?: boolean; version?: boolean } {
  const args = process.argv.slice(2);
  const options: Partial<CliOptions> & { help?: boolean; version?: boolean } = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i] ?? '';
    if (!arg) continue;

    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--version' || arg === '-v') {
      options.version = true;
    } else if (arg === '--template' && args[i + 1]) {
      options.template = args[++i] as TemplateName;
    } else if (arg === '--liff-id' && args[i + 1]) {
      options.liffId = args[++i];
    } else if (!arg.startsWith('--') && !arg.startsWith('-')) {
      options.projectName = arg;
    }
  }

  return options;
}

/** Print usage information */
function printHelp(): void {
  console.log(`
🌴 create-sabai-app — สร้าง LINE Mini App อย่างสบาย

Usage:
  create-sabai-app <project-name> [options]

Options:
  --template <name>   Template to use (${TEMPLATES.join(', ')})
  --liff-id <id>      LINE LIFF ID (or "placeholder" for mock mode)
  --help, -h          Show this help message
  --version, -v       Show version

Examples:
  npx create-sabai-app my-app --template blank --liff-id placeholder
  npx create-sabai-app my-shop --template e-commerce --liff-id 1234567890-abcdefgh

Templates:
  blank         Minimal LIFF app with Vite + React + TypeScript + Tailwind
  e-commerce    Full e-commerce app (SipSabai) with cart, checkout, i18n
`);
}

/**
 * Recursively copy a template directory to the target, replacing placeholders.
 *
 * - Files ending in `.tmpl` have the extension stripped and placeholders replaced
 * - Text files have `{{PLACEHOLDER}}` patterns replaced
 * - Binary files are copied as-is
 *
 * @param srcDir - Source template directory
 * @param destDir - Destination directory to create
 * @param replacements - Map of placeholder strings to their replacement values
 */
function copyTemplate(
  srcDir: string,
  destDir: string,
  replacements: Record<string, string>,
): void {
  mkdirSync(destDir, { recursive: true });

  const entries = readdirSync(srcDir);

  for (const entry of entries) {
    const srcPath = join(srcDir, entry);
    const stat = statSync(srcPath);

    if (stat.isDirectory()) {
      // Skip node_modules and .turbo directories
      if (entry === 'node_modules' || entry === '.turbo' || entry === 'dist') {
        continue;
      }
      copyTemplate(srcPath, join(destDir, entry), replacements);
    } else {
      let destName = entry;

      // Strip .tmpl extension
      if (entry.endsWith('.tmpl')) {
        destName = entry.slice(0, -5);
      }

      const destPath = join(destDir, destName);
      const ext = extname(destName).toLowerCase();

      // Binary files — copy without replacement
      if (BINARY_EXTENSIONS.has(ext)) {
        writeFileSync(destPath, readFileSync(srcPath));
        continue;
      }

      // All non-binary files — read as text and replace placeholders
      let content = readFileSync(srcPath, 'utf-8');

      for (const [placeholder, value] of Object.entries(replacements)) {
        content = content.split(placeholder).join(value);
      }

      writeFileSync(destPath, content, 'utf-8');
    }
  }
}

/**
 * Detect if a package manager is available
 */
function detectPackageManager(): 'pnpm' | 'yarn' | 'npm' {
  try {
    execSync('pnpm --version', { stdio: 'ignore' });
    return 'pnpm';
  } catch {
    // pnpm not available
  }
  try {
    execSync('yarn --version', { stdio: 'ignore' });
    return 'yarn';
  } catch {
    // yarn not available
  }
  return 'npm';
}

/**
 * Main CLI entry point
 */
async function main(): Promise<void> {
  const args = parseArgs();

  // Handle --version
  if (args.version) {
    console.log('create-sabai-app v0.0.1');
    return;
  }

  // Handle --help
  if (args.help) {
    printHelp();
    return;
  }

  console.log('\n🌴 create-sabai-app — สร้าง LINE Mini App อย่างสบาย\n');

  // Gather project name
  const projectName =
    args.projectName || (await prompt('📁 Project name: '));

  if (!projectName) {
    console.error('❌ Project name is required.');
    process.exit(1);
  }

  // Validate project name (basic)
  if (!/^[a-zA-Z0-9_-]+$/.test(projectName)) {
    console.error('❌ Project name can only contain letters, numbers, hyphens and underscores.');
    process.exit(1);
  }

  // Gather template
  const templateInput =
    args.template ||
    (await prompt(`📦 Template (${TEMPLATES.join(', ')}) [blank]: `)) ||
    'blank';

  const template = templateInput as TemplateName;

  if (!TEMPLATES.includes(template)) {
    console.error(
      `❌ Unknown template: "${template}". Available: ${TEMPLATES.join(', ')}`,
    );
    process.exit(1);
  }

  // Gather LIFF ID
  const liffId =
    args.liffId ||
    (await prompt('🔑 LIFF ID (or "placeholder" for mock mode) [placeholder]: ')) ||
    'placeholder';

  // Resolve paths
  const targetDir = resolve(process.cwd(), projectName);

  if (existsSync(targetDir)) {
    console.error(`❌ Directory already exists: ${targetDir}`);
    process.exit(1);
  }

  const templateDir = join(__dirname, 'templates', template);

  if (!existsSync(templateDir)) {
    console.error(
      `❌ Template directory not found: ${templateDir}\n` +
        '   This usually means the CLI was not built correctly.\n' +
        '   Run "pnpm build" in packages/cli first.',
    );
    process.exit(1);
  }

  // Create the project
  console.log(`\n📁 Creating "${projectName}" with "${template}" template...\n`);

  copyTemplate(templateDir, targetDir, {
    '{{PROJECT_NAME}}': projectName,
    '{{LIFF_ID}}': liffId,
  });

  // Count created files
  const fileCount = countFiles(targetDir);
  console.log(`   ✅ Created ${fileCount} files\n`);

  // Ask about install
  const pm = detectPackageManager();
  const shouldInstall = await prompt(
    `📦 Install dependencies with ${pm}? (Y/n): `,
  );

  if (!shouldInstall || shouldInstall.toLowerCase() === 'y' || shouldInstall.toLowerCase() === 'yes') {
    console.log(`\n📦 Installing dependencies with ${pm}...\n`);
    try {
      execSync(`${pm} install`, { cwd: targetDir, stdio: 'inherit' });
      console.log('\n   ✅ Dependencies installed\n');
    } catch {
      console.log('\n   ⚠️  Install failed — you can run it manually later.\n');
    }
  }

  // Print success message
  console.log('✅ Project created successfully!\n');
  console.log('  Next steps:\n');
  console.log(`  cd ${projectName}`);
  if (shouldInstall && shouldInstall.toLowerCase() === 'n') {
    console.log(`  ${pm} install`);
  }
  console.log(`  ${pm}${pm === 'npm' ? ' run' : ''} dev\n`);

  if (liffId === 'placeholder') {
    console.log('  💡 Tip: Running in mock mode. Update .env.development');
    console.log('     with your real LIFF ID when ready.\n');
  }

  console.log('🌴 Happy building! สบาย~\n');
}

/**
 * Count files recursively in a directory
 */
function countFiles(dir: string): number {
  let count = 0;
  const entries = readdirSync(dir);
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      count += countFiles(fullPath);
    } else {
      count++;
    }
  }
  return count;
}

main().catch((err) => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});
