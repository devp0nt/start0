#!/usr/bin/env bun

import { Command } from "commander"
import { Gen0 } from "./utils.js"

const program = new Command()

program
  .name("gen0")
  .description("A code generation tool")
  .version("1.0.0")
  .argument("<file-path>", "Path to the file to process")
  .action(async (filePath: string) => {
    try {
      const gen0 = new Gen0({ cwd: process.cwd() })
      await gen0.processFile({ path: filePath })
      // biome-ignore lint/suspicious/noConsole: CLI tool needs console output
      console.log(`✅ Successfully processed: ${filePath}`)
    } catch (error) {
      // biome-ignore lint/suspicious/noConsole: CLI tool needs console output
      console.error(`❌ Error processing file: ${error instanceof Error ? error.message : String(error)}`)
      process.exit(1)
    }
  })

program.parse()
