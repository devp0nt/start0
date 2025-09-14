#!/usr/bin/env bun

import { Mono0Unit } from "@devp0nt/mono0/unit"
import { Command } from "commander"
import { Mono0 } from "./index"
// import * as readline from "node:readline"
import { Mono0Logger } from "./logger"

const program = new Command()
program.name("mono0").description("A monorepo manager tool").version("1.0.0")

// helpers

const logger = Mono0Logger.create("bin")

const withErrorWrapper = <T extends any[]>(action: (...args: T) => Promise<void>) => {
  return async (...args: T) => {
    try {
      await action(...args)
    } catch (error) {
      logger.error(error)
    }
  }
}
const withMono0 = <T extends any[]>(action: (mono0: Mono0, ...args: T) => Promise<void>) => {
  return withErrorWrapper(async (...args: T) => {
    const mono0 = await Mono0.create()
    await action(mono0, ...args)
  })
}

// commands

program
  .command("ping")
  .description("Ping")
  .action(
    withMono0(async (mono0) => {
      logger.info("pong")
    }),
  )

program
  .command("config")
  .alias("c")
  .description("Show config")
  .action(
    withMono0(async (mono0) => {
      logger.info(JSON.stringify(mono0.config.getMeta({ units: mono0.units }), null, 2))
    }),
  )

program
  .command("tsconfigs")
  .alias("t")
  .description("Show config")
  .action(
    withMono0(async (mono0) => {
      logger.info(
        JSON.stringify(
          await Promise.all(mono0.generalTsconfigs.map((tsconfig) => tsconfig.getMeta({ units: mono0.units }))),
          null,
          2,
        ),
      )
    }),
  )

program
  .command("packageJson")
  .alias("p")
  .description("Show config")
  .action(
    withMono0(async (mono0) => {
      logger.info(JSON.stringify(await mono0.generalPackageJson.getMeta({ units: mono0.units }), null, 2))
    }),
  )

program
  .command("untis")
  .alias("u")
  .description("Show units")
  .argument("[match]", "Match units")
  .argument("[pickKeys]", "Pick meta keys")
  .action(
    withMono0(async (mono0, match: string | undefined, pickKeysString: string | undefined) => {
      const pickKeys = pickKeysString ? pickKeysString.split(",") : undefined
      logger.info(JSON.stringify(await Mono0Unit.getMetaAll({ units: mono0.units, match, pickKeys }), null, 2))
    }),
  )

program
  .command("sync")
  .alias("s")
  .description("Sync files")
  .action(
    withMono0(async (mono0) => {
      await mono0.sync()
    }),
  )

program
  .command("watch")
  .alias("w")
  .description("Watch")
  .action(
    withMono0(async (mono0) => {
      await mono0.watch()
      logger.info(`watcher started`)
    }),
  )

program.parse()
