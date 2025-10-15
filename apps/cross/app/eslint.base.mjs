// https://docs.expo.dev/guides/using-eslint/
import expo from 'eslint-config-expo/flat.js'
import { defineConfig } from 'eslint/config'
import nodePath from 'node:path'
import { resolveFlatConfig } from '@leancodepl/resolve-eslint-flat-config'

export const expoIgnores = ['scripts/reset-project.js']

export const expoFiles = ['**/*.js', '**/*.ts', '**/*.tsx']

export const expoMain = ({ path, main, ignores: providedIgnores = [], files: providedFiles = [] }) => {
  const files = [...expoFiles, ...providedFiles].map((file) => nodePath.join(path, file))
  const ignores = [...expoIgnores, ...providedIgnores].map((ignore) => nodePath.join(path, ignore))
  const paths = { files, ignores }
  return resolveFlatConfig(
    defineConfig([
      {
        ...paths,
        extends: [expo],
      },
      {
        ...paths,
        extends: [main],
      },
      {
        ...paths,
        rules: {
          'no-console': 'off', // Allow console statements in mobile apps
          'no-process-env': 'off', // Allow process.env in Expo apps
          '@typescript-eslint/no-require-imports': 'off', // Allow require for assets
        },
      },
    ]),
  )
}
