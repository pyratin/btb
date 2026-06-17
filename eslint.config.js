import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import json from '@eslint/json';
import css from '@eslint/css';
import { defineConfig } from 'eslint/config';
import eslintReactEslintPlugin from '@eslint-react/eslint-plugin';
import eslintConfigPrettierFlat from 'eslint-config-prettier/flat';
import eslintPluginJsdoc from 'eslint-plugin-jsdoc';

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } }
  },
  tseslint.configs.recommended,
  {
    files: ['**/*.json5'],
    plugins: { json },
    language: 'json/json5',
    extends: ['json/recommended']
  },
  {
    files: ['**/*.css'],
    plugins: { css },
    language: 'css/css',
    extends: ['css/recommended']
  },
  eslintReactEslintPlugin.configs['recommended-typescript'],
  eslintConfigPrettierFlat,
  eslintPluginJsdoc.configs['flat/recommended'],
  { settings: { react: { version: 'detect' } } },
  {
    rules: {
      'no-console': 'error',
      'jsdoc/tag-lines': 'off',
      '@eslint-react/use-state': 'off',
      '@typescript-eslint/no-unused-expressions': [
        'error',
        { allowShortCircuit: true, allowTernary: true }
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { ignoreRestSiblings: true }
      ]
    }
  }
]);
