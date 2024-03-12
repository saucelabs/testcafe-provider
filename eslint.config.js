const ts = require('typescript-eslint');
const js = require('@eslint/js');
const prettier = require('eslint-config-prettier');

module.exports = ts.config(
  js.configs.recommended,
  ...ts.configs.recommended,
  prettier,

  // Generated Files.
  {
    ignores: ['lib/**'],
  },

  // (CommonJS) JavaScript Files.
  {
    files: ['**/*.js'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
    },
  },

  // Test Files.
  {
    files: ['tests/**/*.js'],
    languageOptions: {
      globals: {
        document: true,
      },
    },
  },

  // Everything Else.
  {
    languageOptions: {
      globals: {
        __dirname: true,
        console: true,
        exports: true,
        module: true,
        require: true,
      },
    },
  },
);
