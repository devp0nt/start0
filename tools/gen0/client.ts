import { Gen0ClientProcess } from "@ideanick/tools/gen0/clientProcess"
import type { Gen0Config } from "@ideanick/tools/gen0/config"
import { Gen0File } from "@ideanick/tools/gen0/file"
import type { Gen0Fs } from "@ideanick/tools/gen0/fs"
import { Gen0Target } from "@ideanick/tools/gen0/target"

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

  static async processMany(clients: Gen0Client[]) {
    return await Promise.all(clients.map((client) => client.process()))
  }

  static async findAndCreateAll({
    fs,
    config,
    clientsGlob,
  }: {
    fs: Gen0Fs
    config: Gen0Config
    clientsGlob?: Gen0Config["clients"]
  }) {
    const clientsPaths = await fs.findFilesPathsContentMatch({
      glob: clientsGlob || config.clients,
      search: [Gen0Target.startMark, Gen0Target.silentMark],
    })
    return await Promise.all(clientsPaths.map((filePath) => Gen0Client.create({ filePath, config })))
  }

  static async findAndProcessMany({
    fs,
    config,
    clientsGlob,
  }: {
    fs: Gen0Fs
    config: Gen0Config
    clientsGlob?: Gen0Config["clients"]
  }) {
    const clients = await Gen0Client.findAndCreateAll({ fs, config, clientsGlob })
    return await Gen0Client.processMany(clients)
  }

  static isSameClient(client1: Gen0Client, client2: Gen0Client) {
    return client1.file.path.abs === client2.file.path.abs
  }
}
