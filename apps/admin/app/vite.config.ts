import react from '@vitejs/plugin-react'
import nodeFs from 'fs'
import * as nodePath from 'path'
import { defineConfig, loadEnv } from 'vite'
import { createEnvBuild } from '../base/lib/env'
import { appName, appSlug } from '../../base/general'

export default defineConfig(({ mode }) => {
  const envRaw = loadEnv(mode, process.cwd(), '')
  const env = createEnvBuild(envRaw)

  // tsconfig-paths does not work here, I do not know why
  const tsconfigPath = nodePath.resolve(__dirname, '../../../tsconfig.json')
  const tsconfigDir = nodePath.dirname(tsconfigPath)
  const tsconfigValue = JSON.parse(nodeFs.readFileSync(tsconfigPath, 'utf-8'))
  const paths = tsconfigValue.compilerOptions.paths as Record<string, string[]>
  const baseUrl = tsconfigValue.compilerOptions.baseUrl || '.'
  const aliases = Object.entries(paths).flatMap(([key, value]) => {
    const target = value[0]
    if (key.endsWith('/*')) {
      const find = new RegExp('^' + key.replace(/\/\*$/, '') + '/(.*)$')
      const replacement = nodePath.resolve(tsconfigDir, baseUrl, target.replace(/\/\*$/, '')) + '/$1'
      return { find, replacement }
    } else {
      return {
        find: new RegExp('^' + key + '$'),
        replacement: nodePath.resolve(tsconfigDir, baseUrl, target),
      }
    }
  })

  return {
    server: {
      port: env.PORT,
    },
    resolve: {
      alias: aliases,
    },
    plugins: [react()],
    define: {
      'import.meta.env.APP_NAME': JSON.stringify(appName),
      'import.meta.env.APP_SLUG': JSON.stringify(appSlug),
    },
  }
})
