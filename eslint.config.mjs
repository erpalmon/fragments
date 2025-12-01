// eslint.config.mjs
import globals from 'globals';
import pluginJs from '@eslint/js';

export default [
  // Base recommended JS rules (applied first)
  pluginJs.configs.recommended,

  // Apply CommonJS for all JS files
  {
    files: ['**/*.js'],
    languageOptions: { 
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      // Allow unused variables that start with underscore
      'no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }]
    }
  },

  // Disable no-unused-vars in test and mock files
  {
    files: [
      'tests/**/*.js',
      '**/__mocks__/**/*.js',
      '**/tests/**/*.js'
    ],
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off'
    },
  },
];
