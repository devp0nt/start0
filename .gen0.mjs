export default {
  pluginsGlob: "./**/*.gen0.*",
  clientsGlob: "./**/*.ts",
  clientsExclude: ["**/gen0/index.ts"],
  afterProcessCmd: (filePath) => `bun run lint ${filePath}`,
}
