import type { Gen0Config } from "@ideanick/tools/gen0/config"
import chokidar from "chokidar"
import { isGitIgnored } from "globby"

export class Gen0Watcher {
  config: Gen0Config
  isIgnored: (path: string) => boolean = (path) => false

  private constructor({ config }: { config: Gen0Config }) {
    this.config = config
  }

  static async create({ config }: { config: Gen0Config }) {
    const watcher = new Gen0Watcher({ config })
    watcher.isIgnored = await isGitIgnored({ cwd: config.rootDir })
    return watcher
  }

  async watch() {
    chokidar
      .watch(this.config.rootDir, {
        cwd: this.config.rootDir,
        ignored: this.isIgnored,
        ignoreInitial: true,
        persistent: true,
      })
      .on("add", (path) => {
        console.log("all", path)
      })
      .on("change", (path) => {
        console.log("change", path)
      })
      .on("unlink", (path) => {
        console.log("unlink", path)
      })
      .on("addDir", (path) => {
        console.log("addDir", path)
      })
      .on("unlinkDir", (path) => {
        console.log("unlinkDir", path)
      })
      .on("error", (error) => {
        console.log("error", error)
      })
      .on("ready", () => {
        console.log("ready")
      })
  }
}
