module.exports = {
  root: true,

  env: {
    node: true,
  },

  parser: "vue-eslint-parser",

  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2020
  },

  extends: [
    'plugin:vue/vue3-essential',
    "@vue/airbnb",
    "@vue/typescript/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:vue/recommended",
  ],

  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'linebreak-style': 'off',
    quotes: 'off',
    semi: 'off',
    'comma-dangle': 'off',
    'eol-last': 'off',
    'vue/no-unused-components': 'off',
    'no-multiple-empty-lines': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'no-inferrable-types': 'off',
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    'no-plusplus': 'off',
    'max-len': 'off',
    'object-curly-newline': 'off',
    'no-param-reassign': 'off',
    'vue/multi-word-component-names': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    'prefer-destructuring': 'off',
    'no-restricted-syntax': 'off',
    "@typescript-eslint/no-this-alias": "off"
  },
};
