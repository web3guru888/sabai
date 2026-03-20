import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  // LINE Pay uses node:crypto — mark as external so bundlers don't try to polyfill
  // PromptPay QR and utils are client-safe
  platform: 'node',
  external: ['node:crypto'],
});
