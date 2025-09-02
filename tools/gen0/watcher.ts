/** biome-ignore-all lint/suspicious/noConsole: <x> */
import { Gen0Client } from "@ideanick/tools/gen0/client"
import type { Gen0Config } from "@ideanick/tools/gen0/config"
import type { Gen0Fs } from "@ideanick/tools/gen0/fs"
import type { EmitArgsWithName } from "chokidar"
import { isGitIgnored } from "globby"

export class Gen0Watcher {
  fs: Gen0Fs
  name: string
  config: Gen0Config
  handler: Gen0Watcher.Handler
  watch: Gen0Watcher.Definition["watch"]
  isIgnored: (path: string) => boolean = (path) => false

  private constructor({
    config,
    name,
    fs,
    handler,
    watch,
  }: {
    config: Gen0Config
    name: string
    fs: Gen0Fs
    handler: Gen0Watcher.Handler
    watch: Gen0Watcher.Definition["watch"]
  }) {
    this.name = name
    this.config = config
    this.fs = fs
    this.handler = handler
    this.watch = watch
  }

  static async create({
    config,
    name,
    fs,
    watch,
    handler: providedHandler,
    clients: clientsGlob,
  }: {
    config: Gen0Config
    name: string
    fs: Gen0Fs
    watch: Gen0Watcher.Definition["watch"]
    handler?: Gen0Watcher.Definition["handler"]
    clients?: Gen0Watcher.Definition["clients"]
  }) {
    if (!clientsGlob && !providedHandler) {
      throw new Error(`Clients or/and handler must be provided for watcher ${name}`)
    }
    const handler = Gen0Watcher.createCombinedHandler({ config, clientsGlob, providedHandler, fs })
    const watcher = new Gen0Watcher({ config, name, fs, handler, watch })
    watcher.isIgnored = await isGitIgnored({ cwd: config.rootDir })
    return watcher
  }

  static createCombinedHandler({
    config,
    clientsGlob,
    providedHandler,
    fs,
  }: {
    config: Gen0Config
    clientsGlob?: Gen0Watcher.Definition["clients"]
    providedHandler?: Gen0Watcher.Handler
    fs: Gen0Fs
  }): Gen0Watcher.Handler {
    return (event: Gen0Watcher.EventName, path: string) => {
      if (providedHandler) {
        providedHandler(event, path)
      }
      if (clientsGlob) {
        Gen0Client.findAndProcessMany({ fs, config, clientsGlob })
      }
    }
  }

  static async watchAll() {
    // chokidar
    //   .watch(this.config.rootDir, {
    //     cwd: this.config.rootDir,
    //     ignored: this.isIgnored,
    //     ignoreInitial: true,
    //     persistent: true,
    //   })
    //   .on("all", (event, path) => {
    //     this.handler(event, path)
    //   })
    //   .on("add", (path) => {
    //     console.log("all", path)
    //   })
    //   .on("change", (path) => {
    //     console.log("change", path)
    //   })
    //   .on("unlink", (path) => {
    //     console.log("unlink", path)
    //   })
    //   .on("addDir", (path) => {
    //     console.log("addDir", path)
    //   })
    //   .on("unlinkDir", (path) => {
    //     console.log("unlinkDir", path)
    //   })
    //   .on("error", (error) => {
    //     console.log("error", error)
    //   })
    //   .on("ready", () => {
    //     console.log("ready")
    //   })
  }
}

export namespace Gen0Watcher {
  export type EventName = EmitArgsWithName[0]
  export type Handler = (event: EventName, path: string) => void
  export type Definition = {
    name: string
    watch: Gen0Fs.PathOrPaths
    clients?: Gen0Fs.PathOrPaths
    handler?: Handler
  }
}
