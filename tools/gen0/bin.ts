#!/usr/bin/env bun

import { Command } from "commander"
import { Gen0 } from "./index.js"

const program = new Command()

program.name("gen0").description("A code generation tool").version("1.0.0")

// Main command for processing files
program
  .command("process")
  .description("Process a file with gen0")
  .argument("<file-path>", "Path to the file to process")
  .action(async (filePath: string) => {
    try {
      const gen0 = await Gen0.init()
      await gen0.processFile({ path: filePath })
      // biome-ignore lint/suspicious/noConsole: CLI tool needs console output
      console.log(`✅ Successfully processed: ${filePath}`)
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: CLI tool needs console output
      console.error(`❌ Error processing file: ${error instanceof Error ? error.message : String(error)}`)
      process.exit(1)
    }
  })

// Plugins subcommand
program
  .command("plugins")
  .description("Get plugin paths")
  .action(async () => {
    try {
      const gen0 = await Gen0.init()
      const pluginPaths = await gen0.findPluginsPaths()
      // biome-ignore lint/suspicious/noConsole: CLI tool needs console output
      console.log("Plugin paths:")
      pluginPaths.forEach((path) => {
        // biome-ignore lint/suspicious/noConsole: CLI tool needs console output
        console.log(`  ${path}`)
      })
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: CLI tool needs console output
      console.error(`❌ Error getting plugin paths: ${error instanceof Error ? error.message : String(error)}`)
      process.exit(1)
    }
  })

// show ctx keys
program
  .command("ctx")
  .description("Show gen0 ctx keys")
  .action(async () => {
    try {
      const gen0 = await Gen0.init()
      // biome-ignore lint/suspicious/noConsole: CLI tool needs console output
      console.log("Ctx keys:")
      Object.keys(Gen0.ctx).forEach((key) => {
        // biome-ignore lint/suspicious/noConsole: CLI tool needs console output
        console.log(`  ${key}`)
      })
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: CLI tool needs console output
      console.error(`❌ Error getting plugin paths: ${error instanceof Error ? error.message : String(error)}`)
      process.exit(1)
    }
  })

program.parse()
