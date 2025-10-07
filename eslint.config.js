//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'
import pluginRouter from '@tanstack/eslint-plugin-router'
import pluginQuery from '@tanstack/eslint-plugin-query'
import prettier from 'eslint-config-prettier'
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'

export default [
  // Base TanStack shared rules
  ...tanstackConfig,

  // TanStack Router recommended rules
  ...pluginRouter.configs['flat/recommended'],

  // TanStack Query recommended rules
  ...pluginQuery.configs['flat/recommended'],

  // Your app-specific configuration
  {
    files: ['**/*.{ts,tsx,js,jsx}'],

    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },

    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
      '@typescript-eslint': tsPlugin,
    },

    settings: {
      react: { version: 'detect' },
    },

    rules: {
      // React
      'react/jsx-uses-react': 'off', // React 17+
      'react/react-in-jsx-scope': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // TypeScript
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],

      // Style / formatting
      ...prettier.rules,
    },
  },

  // Ignore build artifacts
  {
    ignores: ['node_modules/**', 'dist/**', 'build/**', '.tanstack/**', 'eslint.config.js', 'prettier.config.js'],
  },
]
