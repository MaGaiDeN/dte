import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import reactPlugin from 'eslint-plugin-react';
import unusedImports from 'eslint-plugin-unused-imports';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      'react': reactPlugin,
      'unused-imports': unusedImports,
      'react-hooks': reactHooks,
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        { 
          'vars': 'all', 
          'varsIgnorePattern': '^_', 
          'args': 'after-used', 
          'argsIgnorePattern': '^_' 
        }
      ],
      'no-console': ['warn', { 'allow': ['warn', 'error'] }],
      'no-duplicate-imports': 'error',
      '@typescript-eslint/no-empty-function': 'warn',
      '@typescript-eslint/no-empty-interface': 'warn',
      'no-empty-pattern': 'warn',
      'react/no-unused-prop-types': 'warn',
      'react/jsx-no-duplicate-props': 'error'
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  }
];
