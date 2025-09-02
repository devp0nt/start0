import { Gen0ClientProcess } from "@ideanick/tools/gen0/clientProcess"
import type { Gen0Config } from "@ideanick/tools/gen0/config"
import { Gen0File } from "@ideanick/tools/gen0/file"
import type { Gen0Fs } from "@ideanick/tools/gen0/fs"
import { Gen0Target } from "@ideanick/tools/gen0/target"

export class Gen0Client {
  config: Gen0Config
  file: Gen0File

  private constructor({ filePath, config }: { filePath: string; config: Gen0Config }) {
    this.config = config
    this.file = Gen0File.create({ filePath, config })
  }

  static create({ filePath, config }: { filePath: string; config: Gen0Config }) {
    return new Gen0Client({ filePath, config })
  }

  async process() {
    const clientProcess = await Gen0ClientProcess.start({ client: this })
    return clientProcess
  }

  static async findAndCreateAll({ fs, config }: { fs: Gen0Fs; config: Gen0Config }) {
    const clientsPaths = await fs.findFilesPathsContentMatch({
      glob: config.clients,
      search: [Gen0Target.startMark, Gen0Target.silentMark],
    })
    return await Promise.all(clientsPaths.map((filePath) => Gen0Client.create({ filePath, config })))
  }
}
