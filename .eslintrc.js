module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  extends: [
    '@nuxtjs',
    'plugin:nuxt/recommended',
    'plugin:prettier/recommended',
    'prettier',
    'prettier/vue'
  ],
  plugins: [
    'prettier'
  ],
  // add your custom rules here
  rules: {
    'nuxt/no-cjs-in-config': 'off',
    'prettier/prettier': 'off',
    'no-console': 'off',
    'no-prototype-builtins': 'off',
    'no-return-assign': 'off',
    'no-eval': 'off',
    'no-case-declarations': 'off'
  }
}
