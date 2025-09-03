import { Page0 } from "@ideanick/site/lib/page0"
import type { Gen0Plugin } from "@ideanick/tools/gen0/plugin"

export default (({ fs }) => {
  const generateRouteByPagePath = async (pagePath: string) => {
    await fs.loadEnv(".env")
    const page: Page0<any, any> = await fs.importFreshDefault(pagePath)
    console.log(1723, page.route)
    const routeDefinition = page.route.getDefinition()

    console.log({
      pagePath,
      routeDefinition,
    })
  }

  return {
    name: "reactRouter",
    onInit: async () => {
      await generateRouteByPagePath("/Users/iserdmi/cc/projects/svagatron/modules/idea/pages/view.page.si.tsx")
    },
    watchers: {
      createRouteByPage: {
        watch: ["~/**/*.page.si.ts{x,}"],
        handler: async (ctx, event, path) => {
          await generateRouteByPagePath(path)
        },
      },
    },
  }
}) satisfies Gen0Plugin.Definition
