// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
    entry: options.entry || ['src/index.ts'],  // Dynamic entry
    format: ['esm'],
    target: 'node20',
    clean: true,
    sourcemap: true,
    splitting: false,
    dts: false,
    noExternal: [],
}));
