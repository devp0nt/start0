#!/usr/bin/env bun

import { Command } from "commander"
import { Gen0 } from "./index.js"

const program = new Command()
program.name("gen0").description("A code generation tool").version("1.0.0")

// helpers

const logger = console

const withErrorWrapper = <T extends any[]>(action: (...args: T) => Promise<void>) => {
  return async (...args: T) => {
    try {
      await action(...args)
    } catch (error) {
      logger.error(error)
    }
  }
}
// const withClearGen0 = <T extends any[]>(action: (gen0: Gen0, ...args: T) => Promise<void>) => {
//   return withErrorWrapper(async (...args: T) => {
//     const gen0 = await Gen0.create()
//     await action(gen0, ...args)
//   })
// }
const withGen0 = <T extends any[]>(action: (gen0: Gen0, ...args: T) => Promise<void>) => {
  return withErrorWrapper(async (...args: T) => {
    const gen0 = await Gen0.create()
    await gen0.init()
    await action(gen0, ...args)
  })
}

// commands

program
  .command("process")
  .alias("p")
  .description("Process a file with gen0 or process all clients if no file path provided")
  .argument("[glob]", "Glob to the files to process (optional)")
  .action(
    withGen0(async (gen0, glob?: string) => {
      if (glob) {
        const results = await gen0.clientsManager.findAndProcessManyByGlob(glob)
        if (results.length === 0) {
          logger.error(`❌ No clients found for glob: ${glob}`)
        } else {
          for (const result of results) {
            logger.info(`✅ ${result.client.file.path.rel}`)
          }
        }
      } else {
        const results = await gen0.clientsManager.findAndProcessAll()
        if (results.length === 0) {
          logger.error(`❌ No clients found by config glob: ${gen0.config.clientsGlob}`)
        } else {
          for (const result of results) {
            logger.info(`✅ ${result.client.file.path.rel}`)
          }
        }
      }
    }),
  )

program
  .command("watch")
  .alias("w")
  .description("Watch")
  .action(
    withGen0(async (gen0) => {
      // gen0.watchersManager.watchAllByChokidar()
      // gen0.watchersManager.watchAllByNative()
      await gen0.watchersManager.watchAllByParcel()
      logger.info("Watchers started")
    }),
  )

const getCommand = program.command("get").alias("g").description("Get various information from gen0")

getCommand
  .command("all")
  .alias("a")
  .description("Show all gen0 info")
  .action(
    withGen0(async (gen0) => {
      logger.info(
        JSON.stringify(
          {
            ...gen0.config.getMeta(),
            plugins: gen0.pluginsManager.getPluginsMeta(),
            fns: gen0.pluginsManager.getFnsMeta(),
            vars: gen0.pluginsManager.getVarsMeta(),
            clients: gen0.clientsManager.getClientsMeta(),
          },
          null,
          2,
        ),
      )
    }),
  )

getCommand
  .command("clients")
  .alias("c")
  .description("Show clients")
  .action(
    withGen0(async (gen0) => {
      logger.info(JSON.stringify(gen0.clientsManager.getClientsMeta(), null, 2))
    }),
  )

getCommand
  .command("plugins")
  .alias("p")
  .description("Show plugins")
  .action(
    withGen0(async (gen0) => {
      logger.info(JSON.stringify(gen0.pluginsManager.getPluginsMeta(), null, 2))
    }),
  )

getCommand
  .command("fns")
  .alias("f")
  .description("Show functions")
  .action(
    withGen0(async (gen0) => {
      logger.info(JSON.stringify(gen0.pluginsManager.getFnsMeta(), null, 2))
    }),
  )

getCommand
  .command("vars")
  .alias("v")
  .description("Show variables")
  .action(
    withGen0(async (gen0) => {
      logger.info(JSON.stringify(gen0.pluginsManager.getVarsMeta(), null, 2))
    }),
  )

getCommand
  .command("vars-values")
  .alias("vv")
  .description("Show variables with values")
  .action(
    withGen0(async (gen0) => {
      logger.info(JSON.stringify(gen0.pluginsManager.getVarsWithMeta(), null, 2))
    }),
  )

getCommand
  .command("watchers")
  .alias("w")
  .description("Show watchers")
  .action(
    withGen0(async (gen0) => {
      logger.info(JSON.stringify(gen0.watchersManager.getAllWatchersOriginalMeta(), null, 2))
    }),
  )

getCommand
  .command("watchers-real")
  .alias("ww")
  .description("Show watchers real meta")
  .action(
    withGen0(async (gen0) => {
      logger.info(JSON.stringify(gen0.watchersManager.getAllWatchersRealMeta(), null, 2))
    }),
  )

program.parse()
