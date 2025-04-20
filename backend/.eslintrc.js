module.exports = {
    env: {
      node: true,
      es2021: true,
      jest: true,
    },
    extends: 'airbnb-base',
    parserOptions: {
      ecmaVersion: 12,
    },
    rules: {
      'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    },
  };