import { exec } from "node:child_process"
import fs from "node:fs/promises"
import nodePath from "node:path"
import vm from "node:vm"
import { Gen0Client } from "@ideanick/tools/gen0/client"
import { Gen0Config } from "@ideanick/tools/gen0/config"
import { Gen0Fs } from "@ideanick/tools/gen0/fs"
import chokidar from "chokidar"
import { findUpSync } from "find-up"
import { globby, isGitIgnored, isGitIgnoredSync } from "globby"
import type _ from "lodash"

// TODO: named actions
// TODO: plugin inport from files
// TODO: export name without ending
// TODO: remove forced new line after first comment
// TODO: boime ignore organize imports
// TODO: watchers
// TODO: typed ctx
// TODO: better parsing, and spaces before finish
// TODO: check if we need static props at all
// TODO: bin file
// TODO: find all files using
// TODO: add logger
// TODO: project root in config
// TODO: many config extensions
// TODO: runner as class
// TODO: plugin as class
// TODO: bin to bin in package.json
// TODO: respect nodepath in globs
// TODO: print inline
// TODO: prim space count

export class Gen0 {
  clients: Gen0Client[] = []
  config: Gen0Config
  fs: Gen0Fs

  private constructor({ config, fs }: { config: Gen0Config; fs: Gen0Fs }) {
    this.config = config
    this.fs = fs
  }

  static async create({ cwd }: { cwd?: string } = {}) {
    const config = await Gen0Config.create({ cwd: cwd || process.cwd() })
    const fs = Gen0Fs.create({ config, cwd: config.rootDir })
    const gen0 = new Gen0({ config, fs })
    return gen0
  }

  async init() {
    this.clients = await Gen0Client.findAndCreateAll({ fs: this.fs, config: this.config })
  }
}

export namespace Gen0 {}
