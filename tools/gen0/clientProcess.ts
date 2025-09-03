import { exec } from "node:child_process"
import type { Gen0Client } from "@ideanick/tools/gen0/client"
import { Gen0ClientProcessCtx } from "@ideanick/tools/gen0/clientProcessCtx"
import type { Gen0Config } from "@ideanick/tools/gen0/config"
import { Gen0Target } from "@ideanick/tools/gen0/target"

export class Gen0ClientProcess {
  ctx: Gen0ClientProcessCtx
  client: Gen0Client
  targets: Gen0Target[] = []
  finishedAt: Date | undefined

  private constructor({ client }: { client: Gen0Client }) {
    this.client = client
    this.ctx = Gen0ClientProcessCtx.create({ client: this.client })
  }

  static async start({ client }: { client: Gen0Client }) {
    const clientProcess = new Gen0ClientProcess({ client })
    let target = await Gen0Target.extract({ client, skipBeforeLineIndex: 0 })
    let clientContent = await client.file.read()
    while (target) {
      const { printed } = await clientProcess.ctx.execScript(target.scriptContent, target.startLineIndex)
      clientContent = await target.fill({ outputContent: printed, clientContent })
      // clientContent = await client.file.read()
      clientProcess.targets.push(target)
      target = await Gen0Target.extract({ client, clientContent, skipBeforeLineIndex: target.outputEndLineIndex })
    }
    clientProcess.finishedAt = new Date()
    await client.file.write(clientContent)
    await clientProcess.runAfterProcessCmd({ afterProcessCmd: client.config.afterProcessCmd })
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
