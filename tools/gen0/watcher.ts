/** biome-ignore-all lint/suspicious/noConsole: <x> */
import type { Gen0ClientsManager } from "@ideanick/tools/gen0/clientsManager"
import type { Gen0Fs } from "@ideanick/tools/gen0/fs"
import type { Gen0Plugin } from "@ideanick/tools/gen0/plugin"
import { Gen0Utils } from "@ideanick/tools/gen0/utils"
import type { EmitArgsWithName } from "chokidar"
import { isGitIgnored } from "globby"

export class Gen0Watcher {
  fs: Gen0Fs
  name: string
  plugin: Gen0Plugin
  handler: Gen0Watcher.Handler
  watchGlob: Gen0Fs.Paths
  originalWatchGlob: Gen0Watcher.Definition["watch"]
  clientsManager: Gen0ClientsManager
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
    handler,
    clientsManager,
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
    handler: Gen0Watcher.Handler
    clientsManager: Gen0ClientsManager
    clientsGlob?: Gen0Fs.Paths
    originalClientsGlob?: Gen0Watcher.Definition["clientsGlob"]
    clientsNames?: Gen0Watcher.Definition["clientsNames"]
    originalHandler?: Gen0Watcher.Definition["handler"]
  }) {
    this.name = name
    this.plugin = plugin
    this.fs = fs
    this.handler = handler
    this.watchGlob = watchGlob
    this.originalWatchGlob = originalWatchGlob
    this.clientsManager = clientsManager
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
    clientsManager,
    clientsGlob: originalClientsGlob,
    clientsNames,
  }: {
    plugin: Gen0Plugin
    name: string
    fs: Gen0Fs
    watch: Gen0Watcher.Definition["watch"]
    handler?: Gen0Watcher.Definition["handler"]
    clientsManager: Gen0ClientsManager
    clientsGlob?: Gen0Watcher.Definition["clientsGlob"]
    clientsNames?: Gen0Watcher.Definition["clientsNames"]
  }) {
    if (!originalClientsGlob && !originalHandler) {
      throw new Error(`Clients or/and handler must be provided for watcher ${name}`)
    }
    const clientsGlob = Gen0Utils.toArray(originalClientsGlob ? fs.toAbs(originalClientsGlob) : [])
    const watchGlob = Gen0Utils.toArray(fs.toAbs(originalWatchGlob))
    const watcher = new Gen0Watcher({
      plugin,
      name,
      fs,
      watchGlob,
      originalWatchGlob,
      handler: Gen0Watcher.getNormalizedHandler({
        originalHandler,
        clientsGlob,
        clientsNames,
        clientsManager,
      }),
      clientsManager,
      clientsGlob,
      originalClientsGlob,
      clientsNames,
      originalHandler,
    })
    return watcher
  }

  static getNormalizedHandler({
    originalHandler,
    clientsGlob,
    clientsNames,
    clientsManager,
  }: {
    originalHandler?: Gen0Watcher.Handler
    clientsGlob?: Gen0Fs.Paths
    clientsNames?: Gen0Watcher.Definition["clientsNames"]
    clientsManager: Gen0ClientsManager
  }): Gen0Watcher.Handler {
    return (event: Gen0Watcher.EventName, path: string) => {
      if (originalHandler) {
        originalHandler(event, path)
      }
      if (clientsGlob) {
        clientsManager.findAndProcessMany(clientsGlob)
      }
      if (clientsNames) {
        clientsManager.processManyByName(clientsNames)
      }
    }
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
  export type EventName = EmitArgsWithName[0]
  export type Handler = (event: EventName, path: string) => void
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
