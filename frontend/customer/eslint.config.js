// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const unusedImports = require('eslint-plugin-unused-imports');
const importPlugin = require('eslint-plugin-import');

module.exports = tseslint.config(
  {
    ignores: [
      'dist/**',
      '.angular/**',
      'node_modules/**',
      'coverage/**',
      '**/*.spec.ts',
      'src/environments/**',
    ],
  },

  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    plugins: {
      'unused-imports': /** @type {any} */ (unusedImports),
      import: /** @type {any} */ (importPlugin),
    },
    processor: angular.processInlineTemplates,
    rules: {
      'no-multiple-empty-lines': ['error', { max: 1 }],
      'no-trailing-spaces': 'error',
      'no-duplicate-imports': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'always'],
      semi: ['error', 'always'],
      'arrow-parens': ['error', 'always'],
      'arrow-body-style': 'off',
      'comma-dangle': 'off',
      indent: 'off',
      curly: 'off',
      quotes: 'off',
      'brace-style': 'off',
      'object-curly-spacing': 'off',
      'object-curly-newline': 'off',
      'lines-between-class-members': 'off',
      'class-methods-use-this': 'off',
      'prefer-object-spread': 'off',
      'import/order': 'error',
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/consistent-indexed-object-style': 'off',
      '@typescript-eslint/consistent-generic-constructors': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@angular-eslint/prefer-inject': 'off',
      '@angular-eslint/component-class-suffix': 'off',
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'app', style: 'kebab-case' },
      ],
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
    },
  },

  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended],
  },
);