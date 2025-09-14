import type { Config } from "@react-router/dev/config"

export default {
  // Config options...
  // Server-side render by default, to enable SPA mode set this to `false`
  ssr: true,
  buildDirectory: "dist",
  appDirectory: "src",
  future: {
    v8_middleware: true,
  },
} satisfies Config
