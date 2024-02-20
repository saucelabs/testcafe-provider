const eslint = require('@eslint/js');
const typescriptEslint = require('typescript-eslint');
const eslintConfigPrettier = require('eslint-config-prettier');

module.exports = typescriptEslint.config(
  eslint.configs.recommended,
  ...typescriptEslint.configs.recommended,
  eslintConfigPrettier,
);
