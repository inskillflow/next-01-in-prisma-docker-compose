import js from '@eslint/js'
import ts from '@typescript-eslint/eslint-plugin'
import parser from '@typescript-eslint/parser'
import prettier from 'eslint-plugin-prettier'

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    ignores: ['.next', 'node_modules', 'dist', 'coverage'],
  },
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        React: 'readonly',
        console: 'readonly',
        process: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': ts,
      prettier,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-unused-expressions': 'warn',
      '@typescript-eslint/no-this-alias': 'warn',
      'prettier/prettier': 'error',
    },
  },
]
