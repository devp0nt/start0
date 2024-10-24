import type { AppContext } from '@/backend/src/services/other/ctx.js'
import { logger } from '@/backend/src/services/other/logger.js'
import { ErroryUnexpected } from '@/general/src/other/errory.js'
import express, { type Express } from 'express'
import { promises as fs } from 'fs'
import { createProxyMiddleware } from 'http-proxy-middleware'
import path from 'path'
import { parsePublicEnv } from 'svag-env'
import { get__dirname } from 'svag-esm'
const __dirname = get__dirname(import.meta)

const checkFileExists = async (filePath: string) => {
  return await fs
    .access(filePath, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false)
}

const findWebappDistDir = async (dir: string): Promise<string | null> => {
  const maybeWebappDistDir = path.resolve(dir, 'webapp/dist')
  if (await checkFileExists(maybeWebappDistDir)) {
    return maybeWebappDistDir
  }
  if (dir === '/') {
    return null
  }
  return await findWebappDistDir(path.dirname(dir))
}

export const applyServeWebApp = async ({ expressApp, ctx }: { expressApp: Express; ctx: AppContext }) => {
  if (ctx.env.isLocalHostEnv()) {
    // eslint-disable-next-line n/no-process-env
    const LOCAL_WEBAPP_SERVE = process.env.LOCAL_WEBAPP_SERVE
    if (LOCAL_WEBAPP_SERVE === 'proxy') {
      expressApp.use(
        createProxyMiddleware({
          target: ctx.env.WEBAPP_URL,
          changeOrigin: true,
          ws: true,
        })
      )
      return
    } else if (LOCAL_WEBAPP_SERVE === 'none') {
      return
    }
  }

  const webappDistDir = await findWebappDistDir(__dirname)
  if (!webappDistDir) {
    if (!ctx.env.isLocalHostEnv()) {
      throw new Error('Webapp dist dir not found')
    } else {
      logger.error({ tag: 'webappServe', error: new ErroryUnexpected('Webapp dist dir not found') })
      return
    }
  }

  const htmlSource = await fs.readFile(path.resolve(webappDistDir, 'index.html'), 'utf8')
  // eslint-disable-next-line n/no-process-env
  const publicEnv = parsePublicEnv({ source: process.env, publicPrefix: 'VITE_' })
  const htmlSourceWithEnv = htmlSource.replace('{ replaceMeWithPublicEnv: true }', JSON.stringify(publicEnv, null, 2))

  expressApp.use(express.static(webappDistDir, { index: false }))
  expressApp.get('/*', (req, res) => {
    res.send(htmlSourceWithEnv)
  })
}
