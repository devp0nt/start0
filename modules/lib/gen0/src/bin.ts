#!/usr/bin/env bun

// import * as readline from "node:readline"
import { Gen0Logger } from "@devp0nt/gen0/logger"
import { Command } from "commander"
import { Gen0 } from "./index.js"

const program = new Command()
program.name("gen0").description("A code generation tool").version("1.0.0")

// helpers

const logger = Gen0Logger.create("bin")

const withErrorWrapper = <T extends any[]>(action: (...args: T) => Promise<void>) => {
  return async (...args: T) => {
    try {
      await action(...args)
    } catch (error) {
      logger.error(error)
    }
  }
}
const withCleanGen0 = <T extends any[]>(action: (gen0: Gen0, ...args: T) => Promise<void>) => {
  return withErrorWrapper(async (...args: T) => {
    const gen0 = await Gen0.create()
    await action(gen0, ...args)
  })
}
const withGen0 = <T extends any[]>(action: (gen0: Gen0, ...args: T) => Promise<void>) => {
  return withErrorWrapper(async (...args: T) => {
    const gen0 = await Gen0.create()
    await gen0.init({ dryRun: false })
    await action(gen0, ...args)
  })
}
const withDryGen0 = <T extends any[]>(action: (gen0: Gen0, ...args: T) => Promise<void>) => {
  return withErrorWrapper(async (...args: T) => {
    const gen0 = await Gen0.create()
    await gen0.init({ dryRun: true })
    await action(gen0, ...args)
  })
}

// commands

program
  .command("process-clients")
  .alias("p")
  .description("Process clients files")
  .argument("[glob]", "Glob to the files to process (optional)")
  .action(
    withGen0(async (gen0, glob?: string) => {
      if (glob) {
        const results = await gen0.clientsManager.findAndProcessManyByGlob(glob)
        if (results.length === 0) {
          logger.error(`No clients files found for glob: ${glob}`)
        }
      } else {
        const results = await gen0.clientsManager.processAll()
        if (results.length === 0) {
          logger.error(`No clients files found by config glob: ${gen0.config.originalClientsGlob}`)
        }
      }
    }),
  )

program
  .command("watch")
  .alias("w")
  .description("Watch")
  // option to process all clients on start
  .option("--dry-run, -d", "Dry run will not write to files on init", false)
  .action(
    withCleanGen0(async (gen0, options: { dryRun: boolean }) => {
      await gen0.init({ dryRun: options.dryRun })
      await gen0.watch()
      logger.info("watcher started")

      // const rl = readline.createInterface({
      //   input: process.stdin,
      //   output: process.stdout,
      //   prompt: "",
      // })
      // rl.prompt()
      // rl.on("line", async (input) => {
      //   const command = input.trim().toLowerCase()
      //   if (command === "p") {
      //     const results = await gen0.clientsManager.processAll()
      //     for (const result of results) {
      //       logger.info(`✅ ${result.client.file.path.rel}`)
      //     }
      //   } else if (command === "q" || command === "quit" || command === "exit") {
      //     rl.close()
      //     process.exit(0)
      //   }
      //   rl.prompt()
      // })
      // rl.on("close", () => {
      //   process.exit(0)
      // })
      process.stdin.setRawMode(true)
      process.stdin.resume()
      process.stdin.setEncoding("utf8")

      process.stdin.on("data", async (key: string) => {
        // handle ctrl+c
        if (key === "\u0003") {
          logger.info("Exiting...")
          process.exit(0)
        }
        if (key === "p") {
          logger.info("Processing all clients...")
          const results = await gen0.clientsManager.processAll()
          for (const result of results) {
            logger.info(`✅ ${result.client.file0.path.rel}`)
          }
        } else if (key === "c") {
          for (let i = 0; i < 10; i++) {
            logger.info("")
          }
        } else if (key === "r") {
          logger.info("Restarting current command...")
          process.exit(0)
        } else if (key === "q") {
          logger.info("Exiting...")
          process.exit(0)
        } else if (key === "h") {
          logger.info("Available keys:")
          logger.info("  p - Process all clients")
          logger.info("  r - Restart currne command")
          logger.info("  c - Add a lot of empty lines")
          logger.info("  q - Quit")
          logger.info("  h - Help")
        }
      })
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
