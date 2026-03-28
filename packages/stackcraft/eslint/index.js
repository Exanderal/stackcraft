/** @type {import('eslint').Linter.Config[]} */
export const config = [
  {
    rules: {
      'no-console': 'warn',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
]
