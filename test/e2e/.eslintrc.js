/* eslint-env node */
module.exports = {
  extends: ['eslint:recommended', 'prettier'],
  env: {
    node: true,
  },
  globals: {
    fixture: true,
    test: true,
    document: true,
  },
};
