import { defineConfig } from 'vitest/config';

export default defineConfig({
    type: 'module',
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: './src/setupTests.js',
        unstubEnvs: true,
    },
});
