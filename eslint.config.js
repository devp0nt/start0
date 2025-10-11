// ESLint flat config using eslint-config-love
import love from 'eslint-config-love'
import prettier from 'eslint-config-prettier'
import { defineConfig } from 'eslint/config'

// TODO: unignore tsfiles and figure out with defaultProject typescript

export default defineConfig([
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
      '**/*.ignore*/**',
      '**/eslint.config.js',
      '**/vite.config.ts',
      '**/tsconfig.json',
      '**/tsconfig.*.json',
    ],
  },
  {
    ...love,
    files: ['**/*.js', '**/*.ts', '**/*.tsx'],
    rules: {
      ...(love.rules ?? {}),
      // temporary
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      'eslint-comments/require-description': 'off',
      '@typescript-eslint/no-unsafe-type-assertion': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      // permanent
      '@typescript-eslint/only-throw-error': [
        'error',
        {
          allow: [{ from: 'package', name: 'Error0', package: '@devp0nt/error0' }],
        },
      ],
      'no-process-env': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { disallowTypeAnnotations: false }],
      '@typescript-eslint/class-methods-use-this': 'off',
      'arrow-body-style': 'off',
      'max-depth': 'off',
      'max-lines': 'off',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/prefer-destructuring': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-unnecessary-type-parameters': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'promise/avoid-new': 'off',
      '@typescript-eslint/init-declarations': 'off',
      '@typescript-eslint/consistent-indexed-object-style': 'off',
      '@typescript-eslint/consistent-type-assertions': 'off',
      complexity: 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-magic-numbers': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
    },
  },
  // Enable prettier formatting via ESLint - must be last to override other configs
  prettier,
])
