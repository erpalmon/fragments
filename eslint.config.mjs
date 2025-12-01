import globals from 'globals';
import pluginJs from '@eslint/js';

export default [
  // Apply to all JS files
  { files: ['**/*.js'], languageOptions: { sourceType: 'commonjs' } },

  // Jest + Node globals
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
  },

  // ✅ NEW OVERRIDE — disable unused vars ONLY in tests & mocks
  {
    files: [
      'tests/**',
      'tests/**/*.js',
      'tests/**/__mocks__/**'
    ],
    rules: {
      'no-unused-vars': 'off',
    },
  },

  pluginJs.configs.recommended,
];
