import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
    globalIgnores(['build']),
    {
        files: ['**/*.{js,jsx,mjs}'],
        extends: [js.configs.recommended],
        plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
        languageOptions: {
            globals: globals.browser,
            parserOptions: { ecmaFeatures: { jsx: true } },
        },
        rules: {
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',
            'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
            // Warn, as CRA did. Existing dead code is a separate cleanup.
            // Components used only in JSX look unused to core ESLint.
            'no-unused-vars': ['warn', { varsIgnorePattern: '^[A-Z_]' }],
        },
    },
    {
        files: ['**/*.test.js', 'src/setupTests.js'],
        languageOptions: { globals: globals.vitest },
    },
    {
        files: ['vite.config.js', 'postcss.config.js', 'tailwind.config.js', 'eslint.config.js', 'scripts/**'],
        languageOptions: { globals: globals.node },
    },
]);
