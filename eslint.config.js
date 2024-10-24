import loveConfig from 'eslint-config-love'
import nodePlugin from 'eslint-plugin-n'

const general = {
  files: ['**/*.js', '**/*.ts', '**/*.tsx', '**/*.jsx'],
  ignores: ['eslint.config.js', 'jest.config.js'],
}

/** @type {import('eslint').Linter.Config} */
export default [
  {
    ...general,
    ...loveConfig,
  },
  {
    ...general,
    plugins: { n: nodePlugin },
    rules: {
      'n/no-process-env': 'error',
    },
  },
  {
    ...general,
    rules: {
      'no-console': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/no-magic-numbers': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/prefer-destructuring': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/only-throw-error': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/consistent-type-assertions': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/triple-slash-reference': 'off',
    },
  },
]
