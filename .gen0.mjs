export default {
  pluginsGlob: "./**/*.gen0.*",
  clientsGlob: "./**/*.ts",
  afterProcessCmd: (filePath) => `bun run lint ${filePath}`,
}
