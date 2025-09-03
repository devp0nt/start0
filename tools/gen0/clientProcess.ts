import { exec } from "node:child_process"
import type { Gen0Client } from "@ideanick/tools/gen0/client"
import { Gen0ClientProcessCtx } from "@ideanick/tools/gen0/clientProcessCtx"
import type { Gen0Config } from "@ideanick/tools/gen0/config"
import { Gen0Logger } from "@ideanick/tools/gen0/logger"
import { Gen0Target } from "@ideanick/tools/gen0/target"

export class Gen0ClientProcess {
  static logger = Gen0Logger.create("clientProcess")
  logger = Gen0ClientProcess.logger

  ctx: Gen0ClientProcessCtx
  client: Gen0Client
  targets: Gen0Target[] = []
  startedAt: Date | undefined
  finishedAt: Date | undefined

  private constructor({ client }: { client: Gen0Client }) {
    this.client = client
    this.ctx = Gen0ClientProcessCtx.create({ client: this.client })
  }

  static async start({ client }: { client: Gen0Client }) {
    const clientProcess = new Gen0ClientProcess({ client })
    clientProcess.startedAt = new Date()
    let target = await Gen0Target.extract({ client, skipBeforeLineIndex: 0 })
    let clientContent = await client.file.read()
    const errors: Gen0ClientProcessCtx.NormalizedVmError[] = []
    while (target) {
      const { printed, error } = await clientProcess.ctx.execScript(target.scriptContent, target.startLineIndex)
      if (error) {
        errors.push(error)
      }
      clientContent = await target.fill({ outputContent: printed, clientContent })
      // clientContent = await client.file.read()
      clientProcess.targets.push(target)
      target = await Gen0Target.extract({ client, clientContent, skipBeforeLineIndex: target.outputEndLineIndex })
    }
    clientProcess.finishedAt = new Date()
    await client.file.write(clientContent)
    await clientProcess.runAfterProcessCmd({ afterProcessCmd: client.config.afterProcessCmd })
    if (errors.length > 0) {
      for (const error of errors) {
        this.logger.error(error)
      }
      this.logger.error(
        `"${client.file.path.rel}" processed with errors in ${clientProcess.finishedAt.getTime() - clientProcess.startedAt.getTime()}ms`,
      )
    } else {
      this.logger.info(
        `"${client.file.path.rel}" processed in ${clientProcess.finishedAt.getTime() - clientProcess.startedAt.getTime()}ms`,
      )
    }
    return clientProcess
  }

  async runAfterProcessCmd({ afterProcessCmd }: { afterProcessCmd: Gen0Config.AfterProcessCmd | undefined }) {
    if (afterProcessCmd) {
      if (typeof afterProcessCmd === "function") {
        await exec(afterProcessCmd(this.client.file.path.abs))
      } else {
        await exec(afterProcessCmd)
      }
    }
  }
}
