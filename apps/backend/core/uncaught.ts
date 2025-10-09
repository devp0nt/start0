import type { Tri0 } from '@backend/base/tri0'
import type { Ctx0 } from '@devp0nt/ctx0'

export const applyUncaughtExceptionCatcher = ({ tri0, ctx }: { tri0: Tri0; ctx: Ctx0.Proxy<any> }) => {
  process.on('uncaughtException', (error) => {
    void (async () => {
      try {
        tri0.logger.error(error, {
          tag: 'uncaughtException',
        })
        await ctx.self.destroy()
      } catch (errorCtxDestroy) {
        try {
          tri0.logger.error(errorCtxDestroy, {
            tag: 'uncaughtException:ctxDestroy',
          })
        } catch (errorFatal) {
          // eslint-disable-next-line no-console
          console.error(error, errorCtxDestroy, errorFatal)
        }
      } finally {
        process.exit(1)
      }
    })()
  })
}
