import type { Express } from 'express'
import type { AppContext } from '@/backend/src/services/other/ctx.js'

// @index('./**/index.ts', f => `import { ${f.path.split('/').slice(0, -1).pop()}RestRoute } from '${f.path}.js'`)

// @endindex
// @index('../../../../general/src/**/route.rest.ts', f => `import { ${f.path.split('/').slice(0, -1).pop()}RestRoute } from '${f.path.replace('../../../../general', '@/general')}.js'`)

// @endindex

export const appplyApiRoutesToExpressApp = ({ expressApp, ctx }: { expressApp: Express; ctx: AppContext }) => {
  // @index('./**/index.ts', f => `${f.path.split('/').slice(0, -1).pop()}RestRoute.appplyApiRouteToExpressApp({ ctx, expressApp })`)

  // @endindex
  // @index('../../../../general/src/**/route.rest.ts', f => `${f.path.split('/').slice(0, -1).pop()}RestRoute.appplyApiRouteToExpressApp({ ctx, expressApp })`)

  // @endindex
}
