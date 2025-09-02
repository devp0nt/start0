import type { Gen0Client } from "@ideanick/tools/gen0/client"
import { Gen0ClientProcessCtx } from "@ideanick/tools/gen0/clientCtx"
import { Gen0Target } from "@ideanick/tools/gen0/target"

export class Gen0ClientProcess {
  ctx: Gen0ClientProcessCtx
  client: Gen0Client
  targets: Gen0Target[] = []

  private constructor({ client }: { client: Gen0Client }) {
    this.client = client
    this.ctx = Gen0ClientProcessCtx.create({ client: this.client })
  }

  static async start({ client }: { client: Gen0Client }) {
    const clientProcess = new Gen0ClientProcess({ client })
    let target = await Gen0Target.extract({ client, skipBeforeLineIndex: 0 })
    while (target) {
      const { printed } = await clientProcess.ctx.execScript(target.scriptContent)
      await target.fill(printed)
      clientProcess.targets.push(target)
      target = await Gen0Target.extract({ client, skipBeforeLineIndex: target.outputEndLineIndex })
    }
    return clientProcess
  }
}
