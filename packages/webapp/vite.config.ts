/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { generalAppConfig } from '../general/src/other/generalAppConfig.js'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
import autoprefixer from 'autoprefixer'
import { cpus } from 'os'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import { getDotEnvData } from 'svag-dotenv'
import { parsePublicEnv } from 'svag-env'
import { get__dirname } from 'svag-esm'
import type { Plugin } from 'vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import svgr from 'vite-plugin-svgr'
import tsconfig from './tsconfig.json'

const cwd = get__dirname(import.meta)
const env = getDotEnvData({ cwd })
const publicEnv = parsePublicEnv({ source: env, publicPrefix: 'VITE_' })
const sentryEnabled = true
const pwa = false
const bundleStats = env.HOST_ENV === 'local'
const projectName = generalAppConfig.projectName
const port = env.PORT ? Number(env.PORT) : 3000
const sourceVersion = env.SOURCE_VERSION
const sentryAuthToken = env.SENTRY_AUTH_TOKEN
const sentryProject = 'webapp'
const resolveAlieses = Object.fromEntries(
  Object.entries(tsconfig.compilerOptions.paths).map(([key, [value]]) => [
    key.replace('/*', ''),
    path.resolve(cwd, value.replace('/*', '')),
  ])
)

if (sentryEnabled) {
  if (!sentryAuthToken) {
    throw new Error('SENTRY_AUTH_TOKEN is required')
  }
  if (!sourceVersion) {
    throw new Error('SOURCE_VERSION is required')
  }
  if (!sentryProject) {
    throw new Error('SENTRY_PROJECT is required')
  }
}

const sourcemapExclude = (opts?: { excludeNodeModules?: boolean }): Plugin => {
  return {
    name: 'sourcemap-exclude',
    transform: (code: string, id: string) => {
      if (opts?.excludeNodeModules && id.includes('node_modules')) {
        return {
          code,
          // https://github.com/rollup/rollup/blob/master/docs/plugin-development/index.md#source-code-transformations
          map: { mappings: '' },
        }
      }
      return undefined
    },
  }
}

export default defineConfig(() => {
  return {
    resolve: {
      alias: resolveAlieses,
    },
    plugins: [
      sourcemapExclude({ excludeNodeModules: true }),
      !pwa
        ? undefined
        : VitePWA({
            registerType: 'autoUpdate',
            strategies: 'injectManifest',
            srcDir: 'src',
            filename: 'sw.ts',
            // injectRegister: 'script',
            injectManifest: {
              injectionPoint: undefined,
            },
            manifest: {
              name: projectName,
              short_name: projectName,
              icons: [
                {
                  src: '/android-chrome-192x192.png',
                  sizes: '192x192',
                  type: 'image/png',
                },
                {
                  src: '/android-chrome-512x512.png',
                  sizes: '512x512',
                  type: 'image/png',
                },
              ],
              theme_color: '#ffffff',
              background_color: '#ffffff',
              display: 'standalone',
            },
            devOptions: {
              enabled: true,
            },
          }),
      react({
        // ...(babelPlugins ? { babel: { plugins: babelPlugins, babelrc: false, configFile: false } } : {}),
      }),
      svgr(),
      legacy({
        targets: ['> 2%'],
      }),
      !bundleStats
        ? undefined
        : visualizer({
            filename: './dist/bundle-stats.html',
            gzipSize: true,
            brotliSize: true,
          }),
      !sentryAuthToken || !sourceVersion || !sentryProject
        ? undefined
        : sentryVitePlugin({
            project: sentryProject,
            authToken: sentryAuthToken,
            release: { name: sourceVersion },
          }),
    ],
    css: {
      postcss: {
        plugins: [autoprefixer({})],
      },
    },
    build: {
      sourcemap: true,
      chunkSizeWarningLimit: 900,
      rollupOptions: {
        maxParallelFileOps: Math.max(1, cpus().length - 1),
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              return 'vendor'
            }
            return undefined
          },
          sourcemapIgnoreList: (relativeSourcePath) => {
            const normalizedPath = path.normalize(relativeSourcePath)
            return normalizedPath.includes('node_modules')
          },
        },
        cache: false,
      },
    },
    server: {
      host: true,
      port,
    },
    preview: {
      port,
    },
    define: {
      'process.env': publicEnv || {},
    },
  }
})
