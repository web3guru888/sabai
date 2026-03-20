import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    promptpay: 'src/promptpay.ts',
    linepay: 'src/linepay.ts',
    omise: 'src/omise.ts',
  },
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  platform: 'node',
  external: ['node:crypto'],
});
