import { appSlug } from '@apps/shared/general'
import { createEnv } from '@backend/core/env'
import { Ctx0 } from '@devp0nt/ctx0'
import { Error0 } from '@devp0nt/error0'
import { Logger0 } from '@devp0nt/logger0'
import { logger0AdapterProject } from '@devp0nt/logger0/adapters/logger0-adapter-project'
import { Meta0 } from '@devp0nt/meta0'
import { Tri0 as OriginalTri0 } from '@devp0nt/tri0'
import { createPrismaClient } from '@prisma/backend/client'

export const createTri0 = () => {
  Logger0.init({
    filterByTags: process.env.DEBUG,
    reset: true,
    rootTagPrefix: appSlug,
    consoleFormatter: process.env.NODE_ENV === 'development' ? 'prettyYaml' : 'json',
    filters: {
      ...(process.env.NODE_ENV === 'development'
        ? {
            dev: (record) => {
              // TODO0: fix logger filters
              if (record.category.includes('prisma')) {
                return false
              }
              return true
            },
          }
        : {}),
    },
  })
  const logger = Logger0.create({
    adapter: logger0AdapterProject,
  })
  const meta = Meta0.create({
    tagPrefix: 'backend',
  })
  const tri0 = OriginalTri0.create({
    Error0,
    logger,
    meta,
  })
  return tri0
}
export type Tri0 = ReturnType<typeof createTri0>

export const createBackendCtx = ({ service, tri0 }: { service: string; tri0: Tri0 }) => {
  return Ctx0.create('backend', () => {
    const env = createEnv(process.env)
    const prisma = createPrismaClient({
      tri0,
      isTestNodeEnv: env.isTestNodeEnv,
      isLocalHostEnv: env.isLocalHostEnv,
    })
    return {
      tri0,
      prisma,
      env,
    }
  })
}

export type BackendCtx = ReturnType<typeof createBackendCtx>
export type BackendCtxValue = Omit<BackendCtx, 'self'>
