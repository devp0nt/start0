import { Gen0ClientProcess } from "@ideanick/tools/gen0/clientProcess"
import type { Gen0Config } from "@ideanick/tools/gen0/config"
import { Gen0File } from "@ideanick/tools/gen0/file"
import type { Gen0Fs } from "@ideanick/tools/gen0/fs"

export class Gen0Client {
  config: Gen0Config
  file: Gen0File
  name: string

  private constructor({ filePath, config, name }: { filePath: string; config: Gen0Config; name?: string }) {
    this.config = config
    this.file = Gen0File.create({ filePath, config })
    this.name = name || this.file.path.rel
  }

  static create({ filePath, config, name }: { filePath: string; config: Gen0Config; name?: string }) {
    return new Gen0Client({ filePath, config, name })
  }

  async process() {
    const clientProcess = await Gen0ClientProcess.start({ client: this })
    return clientProcess
  }

  isSame(client: Gen0Client) {
    return this.file.path.abs === client.file.path.abs
  }

  isMatchGlob(clientsGlob: Gen0Fs.PathOrPaths) {
    return this.file.fs.isPathMatchGlob(this.file.path.abs, clientsGlob)
  }

  isMatchName(nameSearch: Gen0Fs.Search) {
    return this.file.fs.isStringMatch(this.name, nameSearch)
  }
}
