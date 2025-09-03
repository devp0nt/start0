import { Logger0 } from "@ideanick/modules/lib/logger0.sh"
import debug from "debug"

export class Gen0Logger extends Logger0 {
  static rootTagPrefix = "gen0"

  static init1(debugConfig?: string | boolean) {
    return Gen0Logger.create({
      debugConfig: !debugConfig ? "" : typeof debugConfig === "string" ? debugConfig : `${Gen0Logger.rootTagPrefix}:*`,
    })
  }

  static create1(tagPrefix: string) {
    return Gen0Logger.create({
      meta: {
        tagPrefix,
      },
      skipInit: true,
    })
  }

  static redebug1(debugConfig?: string | boolean) {
    debug.enable(!debugConfig ? "" : typeof debugConfig === "string" ? debugConfig : `${Gen0Logger.rootTagPrefix}:*`)
  }
}
