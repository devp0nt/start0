// ESLint flat config using eslint-config-love
import love from 'eslint-config-love'
import prettierRecommended from 'eslint-plugin-prettier/recommended'

export default [
  // Global ignores to keep linting fast and avoid vendor/build dirs
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.react-router/**',
      '**/generated*',
      '**/.cache/**',
      '**/.husky/**',
      '**/.git/**',
      'eslint.config.js',
    ],
  },
  {
    ...love,
    files: ['**/*.js', '**/*.ts', '**/*.tsx'],
    rules: {
      ...(love.rules ?? {}),
      // all
      '@typescript-eslint/only-throw-error': [
        'error',
        {
          allow: [{ from: 'package', name: 'Error0', package: '@devp0nt/error0' }],
        },
      ],
      '@typescript-eslint/consistent-type-imports': ['error', { disallowTypeAnnotations: false }],
      'arrow-body-style': 'off',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/prefer-destructuring': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-unnecessary-type-parameters': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'promise/avoid-new': 'off',
      // project
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-magic-numbers': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      // library
    },
  },
  // Enable prettier formatting via ESLint - must be last to override other configs
  prettierRecommended,
]
