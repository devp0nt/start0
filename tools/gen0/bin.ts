#!/usr/bin/env bun

import { Command } from "commander"
import { Gen0 } from "./index.js"

const program = new Command()

program.name("gen0").description("A code generation tool").version("1.0.0")

// Main command for processing files
program
  .command("run")
  .description("Process a file with gen0 or process all clients if no file path provided")
  .argument("[file-path]", "Path to the file to process (optional)")
  .action(async (filePath?: string) => {
    try {
      const gen0 = await Gen0.init()

      if (filePath) {
        await gen0.processFile({ path: filePath })
        // biome-ignore lint/suspicious/noConsole: CLI tool needs console output
        console.info(`✅ Successfully processed: ${filePath}`)
      } else {
        await gen0.processClients()
        // biome-ignore lint/suspicious/noConsole: CLI tool needs console output
        console.info(`✅ Successfully processed all clients`)
      }
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: CLI tool needs console output
      console.error(`❌ Error processing ${filePath ? `file: "${filePath}"` : "clients"}`)
      // biome-ignore lint/suspicious/noConsole: <x>
      console.error(error)
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
      // biome-ignore lint/suspicious/noConsole: <x>
      console.error(error)
      process.exit(1)
    }
  })

// show ctx keys
program
  .command("ctx")
  .description("Show gen0 ctx keys")
  .action(async () => {
    try {
      await Gen0.init()
      // biome-ignore lint/suspicious/noConsole: CLI tool needs console output
      console.log("Ctx keys:")
      Object.keys(Gen0.ctx).forEach((key) => {
        // biome-ignore lint/suspicious/noConsole: CLI tool needs console output
        console.log(`  ${key}`)
      })
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: CLI tool needs console output
      console.error(`❌ Error getting ctx keys: ${error instanceof Error ? error.message : String(error)}`)
      // biome-ignore lint/suspicious/noConsole: <x>
      console.error(error)
      process.exit(1)
    }
  })

// show clients
program
  .command("clients")
  .description("Show clients")
  .action(async () => {
    try {
      const gen0 = await Gen0.init()
      // biome-ignore lint/suspicious/noConsole: CLI tool needs console output
      console.log("Clients:")
      const clients = await gen0.findClientsPaths()
      clients.forEach((client) => {
        // biome-ignore lint/suspicious/noConsole: CLI tool needs console output
        console.log(`  ${client}`)
      })
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: CLI tool needs console output
      console.error(`❌ Error getting clients: ${error instanceof Error ? error.message : String(error)}`)
      // biome-ignore lint/suspicious/noConsole: <x>
      console.error(error)
      process.exit(1)
    }
  })

program.parse()
