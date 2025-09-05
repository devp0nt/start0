import { createEnvBuild } from "@ideanick/site/src/lib/env"
import { reactRouter } from "@react-router/dev/vite"
import { reactRouterHonoServer } from "react-router-hono-server/dev"
import { defineConfig, loadEnv } from "vite"
import devtoolsJson from "vite-plugin-devtools-json"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig(({ mode }) => {
  const envRaw = loadEnv(mode, process.cwd(), "")
  const env = createEnvBuild(envRaw)
  return {
    build: {
      target: "esnext",
    },
    server: {
      port: env.PORT,
    },
    plugins: [
      devtoolsJson(),
      reactRouterHonoServer({
        runtime: "bun",
      }),
      tsconfigPaths(),
      reactRouter(),
    ],
  }
})
