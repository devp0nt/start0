#!/usr/bin/env bun

import { Command } from "commander"
import { Gen0 } from "./index.js"

const program = new Command()
program.name("gen0").description("A code generation tool").version("1.0.0")

// helpers

// TODO: add logger
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
const withGen0 = <T extends any[]>(action: (gen0: Gen0, ...args: T) => Promise<void>) => {
  return withErrorWrapper(async (...args: T) => {
    const gen0 = await Gen0.init()
    await action(gen0, ...args)
  })
}
const printArray = <T>(array: T[]) => {
  for (const item of array) {
    logger.info(`${item}`)
  }
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
        const results = await gen0.clientsManager.findAndProcessMany(glob)
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
  .command("config")
  .alias("c")
  .description("Show gen0 config")
  .action(
    withGen0(async (gen0) => {
      logger.info(
        JSON.stringify(
          {
            rootDir: gen0.config.rootDir,
            afterProcessCmd: gen0.config.afterProcessCmd,
            pluginsGlob: gen0.config.pluginsGlob,
            plugins: Object.keys(gen0.config.plugins),
            clients: gen0.config.clientsGlob,
            fns: Object.keys(gen0.config.fns),
            vars: Object.keys(gen0.config.vars),
          },
          null,
          2,
        ),
      )
    }),
  )

program
  .command("clients")
  .alias("cl")
  .description("Show clients")
  .action(
    withGen0(async (gen0) => {
      const paths = gen0.clientsManager.clients.map((client) => client.file.path.rel)
      if (paths.length === 0) {
        logger.error(`❌ No clients found by config glob: ${gen0.config.clientsGlob}`)
      } else {
        logger.info(`✅ ${paths.length} clients found`)
        printArray(paths)
      }
    }),
  )

program
  .command("watch")
  .alias("w")
  .description("Watch")
  .action(
    withGen0(async (gen0) => {
      // await gen0.watch()
    }),
  )

program.parse()
