import { appSlug } from '@apps/shared/general'
import { env } from '@backend/base/env.runtime'
import { Error0 } from '@devp0nt/error0'
import { Logger0 } from '@devp0nt/logger0'
import { logger0AdapterProject } from '@devp0nt/logger0/adapters/logger0-adapter-project'
import { Meta0 } from '@devp0nt/meta0'
import { Tri0 as OriginalTri0 } from '@devp0nt/tri0'

Logger0.init({
  filterByTags: env.LOGGER_FILTER,
  reset: true,
  rootTagPrefix: appSlug,
  errorTagSuffix: 'err',
  consoleFormatter: env.isDevelopmentNodeEnv ? 'prettyYaml' : 'json',
})
const logger = Logger0.create({
  adapter: logger0AdapterProject,
})
const meta = Meta0.create()
export const baseTri0 = OriginalTri0.create({
  Error0,
  logger,
  meta,
})
export type Tri0 = typeof baseTri0
