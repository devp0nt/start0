// https://docs.expo.dev/guides/using-eslint/
import expo from 'eslint-config-expo/flat.js'
import { defineConfig } from 'eslint/config'
import nodePath from 'node:path'
import { resolveFlatConfig } from '@leancodepl/resolve-eslint-flat-config'

export const expoIgnores = ['scripts/reset-project.js']

export const expoFiles = ['**/*.js', '**/*.ts', '**/*.tsx']

export const expoConfig = ({ path, mainConfig, ignores: providedIgnores = [], files: providedFiles = [] }) => {
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
        extends: [mainConfig],
      },
      {
        ...paths,
        rules: {
          'no-console': 'off',
          'no-process-env': 'off',
          '@typescript-eslint/no-require-imports': 'off',
        },
      },
    ]),
  )
}
