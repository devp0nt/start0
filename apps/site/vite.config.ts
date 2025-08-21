import { reactRouter } from "@react-router/dev/vite"
import { reactRouterHonoServer } from "react-router-hono-server/dev"
import { defineConfig, loadEnv } from "vite"
import devtoolsJson from "vite-plugin-devtools-json"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  const port = +env.PORT
  return {
    build: {
      target: "esnext",
    },
    server: {
      port,
    },
    plugins: [
      devtoolsJson(),
      reactRouterHonoServer({
        runtime: "bun",
      }),
      reactRouter(),
      tsconfigPaths(),
    ],
  }
})
