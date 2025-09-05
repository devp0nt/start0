import type { Gen0ClientsManager } from "@ideanick/tools/gen0/clientsManager"
import type { Gen0Fs } from "@ideanick/tools/gen0/fs"
import { Gen0Logger } from "@ideanick/tools/gen0/logger"
import type { Gen0Plugin } from "@ideanick/tools/gen0/plugin"
import { Gen0Utils } from "@ideanick/tools/gen0/utils"
import type { Gen0WatchersManager } from "@ideanick/tools/gen0/watchersManager"
import { uniq } from "lodash"

export class Gen0Watcher {
  static logger = Gen0Logger.create("watcher")
  logger = Gen0Watcher.logger

  fs: Gen0Fs
  name: string
  plugin: Gen0Plugin
  watchGlob: Gen0Fs.Paths
  originalWatchGlob: Gen0Watcher.Definition["watch"]
  clientsGlob: Gen0Fs.Paths | undefined
  clientsNames: Gen0Watcher.Definition["clientsNames"]
  originalClientsGlob: Gen0Watcher.Definition["clientsGlob"]
  originalHandler: Gen0Watcher.Definition["handler"]

  private constructor({
    plugin,
    name,
    fs,
    watchGlob,
    originalWatchGlob,
    clientsGlob,
    originalClientsGlob,
    clientsNames,
    originalHandler,
  }: {
    plugin: Gen0Plugin
    name: string
    fs: Gen0Fs
    watchGlob: Gen0Fs.Paths
    originalWatchGlob: Gen0Watcher.Definition["watch"]
    clientsGlob?: Gen0Fs.Paths
    originalClientsGlob?: Gen0Watcher.Definition["clientsGlob"]
    clientsNames?: Gen0Watcher.Definition["clientsNames"]
    originalHandler?: Gen0Watcher.Definition["handler"]
  }) {
    this.name = name
    this.plugin = plugin
    this.fs = fs
    this.watchGlob = watchGlob
    this.originalWatchGlob = originalWatchGlob
    this.clientsGlob = clientsGlob
    this.originalClientsGlob = originalClientsGlob
    this.clientsNames = clientsNames
    this.originalHandler = originalHandler
  }

  static async create({
    plugin,
    name,
    fs,
    watch: originalWatchGlob,
    handler: originalHandler,
    clientsGlob: originalClientsGlob,
    clientsNames,
  }: {
    plugin: Gen0Plugin
    name: string
    fs: Gen0Fs
    watch: Gen0Watcher.Definition["watch"]
    handler?: Gen0Watcher.Definition["handler"]
    clientsGlob?: Gen0Watcher.Definition["clientsGlob"]
    clientsNames?: Gen0Watcher.Definition["clientsNames"]
  }) {
    if (!originalClientsGlob && !originalHandler && !clientsNames) {
      throw new Error(
        `Clients or/and handler or/and clientsNames must be provided for watcher "${name}" in plugin "${plugin.name}"`,
      )
    }
    const clientsGlob = Gen0Utils.toArray(originalClientsGlob ? fs.toAbs(originalClientsGlob) : [])
    const watchGlob = Gen0Utils.toArray(fs.toAbs(originalWatchGlob))
    const watcher = new Gen0Watcher({
      plugin,
      name,
      fs,
      watchGlob,
      originalWatchGlob,
      clientsGlob,
      originalClientsGlob,
      clientsNames,
      originalHandler,
    })
    return watcher
  }

  handler: Gen0Watcher.Handler = async (
    ctx: Gen0Watcher.HandlerCtx,
    event: Gen0WatchersManager.EventType,
    path: string,
  ) => {
    try {
      if (!this.isPathMatchWatchGlob(path)) {
        return
      }
      this.logger.info(
        `watcher "${this.name}" of plugin "${uniq([this.plugin.name, this.plugin.file?.path.rel]).filter(Boolean).join(":")}" received event "${event}" for path "${path}"`,
      )
      if (this.originalHandler) {
        await this.originalHandler(ctx, event, path)
      }
      if (this.clientsGlob) {
        await ctx.clientsManager.findAndProcessManyByGlob(this.clientsGlob)
      }
      if (this.clientsNames) {
        await ctx.clientsManager.processManyByNames(this.clientsNames)
      }
    } catch (error) {
      this.logger.error(
        `error in watcher "${this.name}" of plugin "${uniq([this.plugin.name, this.plugin.file?.path.rel]).filter(Boolean).join(":")}"\n`,
        error,
      )
    }
  }

  isPathMatchWatchGlob(path: string) {
    return this.fs.isPathMatchGlob(path, this.watchGlob)
  }

  isSame(watcher: Gen0Watcher) {
    return this.plugin.name === watcher.plugin.name && this.name === watcher.name
  }

  isMatchName(nameSearch: Gen0Utils.Search) {
    return Gen0Utils.isStringMatch(this.name, nameSearch)
  }

  getOriginalMeta(): Gen0Watcher.OriginalMeta {
    return {
      name: this.name,
      plugin: this.plugin.name,
      watch: this.originalWatchGlob,
      ...(this.originalClientsGlob ? { clientsGlob: this.originalClientsGlob } : {}),
      ...(this.clientsNames ? { clientsNames: this.clientsNames } : {}),
    }
  }

  getRealMeta(): Gen0Watcher.RealMeta {
    return {
      name: this.name,
      plugin: this.plugin.name,
      watchGlob: this.watchGlob,
      originalWatchGlob: this.originalWatchGlob,
      clientsGlob: this.clientsGlob,
      originalClientsGlob: this.originalClientsGlob,
      clientsNames: this.clientsNames,
      originalHandler: this.originalHandler,
    }
  }
}

export namespace Gen0Watcher {
  export type HandlerCtx = {
    clientsManager: Gen0ClientsManager
    fs: Gen0Fs
  }
  export type Handler = (ctx: Gen0Watcher.HandlerCtx, event: Gen0WatchersManager.EventType, path: string) => void
  export type OriginalMeta = {
    name: string
    plugin: string
    watch: Gen0Fs.PathOrPaths
    clientsGlob?: Gen0Fs.PathOrPaths
    clientsNames?: Gen0Utils.Search
  }
  export type RealMeta = {
    name: string
    plugin: string
    watchGlob: Gen0Fs.Paths
    originalWatchGlob: Gen0Watcher.Definition["watch"]
    clientsGlob: Gen0Fs.Paths | undefined
    originalClientsGlob: Gen0Watcher.Definition["clientsGlob"]
    clientsNames: Gen0Watcher.Definition["clientsNames"]
    originalHandler: Gen0Watcher.Definition["handler"]
  }
  export type Definition = {
    name?: string
    watch: Gen0Fs.PathOrPaths
    clientsGlob?: Gen0Fs.PathOrPaths
    clientsNames?: Gen0Utils.Search
    handler?: Handler
  }
  export type DefinitionWithName = Omit<Definition, "name"> & { name: string }
}
