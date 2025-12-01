// eslint.config.mjs
import globals from 'globals';
import pluginJs from '@eslint/js';

export default [
  // Apply CommonJS for all JS files
  {
    files: ['**/*.js'],
    languageOptions: { sourceType: 'commonjs' },
  },

  // Add globals for Node & Jest
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
  },

  // ✅ Disable no-unused-vars ONLY in test + mock files
  {
    files: [
      'tests/**',
      'tests/**/*.js',
      'tests/**/__mocks__/**',
    ],
    rules: {
      'no-unused-vars': 'off',
    },
  },

  // Base recommended JS rules
  pluginJs.configs.recommended,
];
