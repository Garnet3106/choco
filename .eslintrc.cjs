module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    'comma-dangle': ['warn', 'always-multiline'],
    'comma-spacing': ['warn', {
      before: false,
      after: true,
    }],
    indent: ['warn', 2, { SwitchCase: 1 }],
    'key-spacing': ['warn', {
      beforeColon: false,
      afterColon: true,
    }],
    'no-trailing-spaces': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    'no-unused-expressions': 'warn',
    quotes: ['warn', 'single', { allowTemplateLiterals: true }],
    semi: 'warn',
  },
}
