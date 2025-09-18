// Temporary placeholder for env functionality
export const createEnvBuild = (source: Record<string, unknown>) => ({
  PORT: Number(source.PORT) || 3000,
})

export type EnvBuild = ReturnType<typeof createEnvBuild>

export const createEnv = (source: Record<string, unknown>) => ({
  VITE_TRPC_URL: String(source.VITE_TRPC_URL || ''),
})

export type Env = ReturnType<typeof createEnv>
