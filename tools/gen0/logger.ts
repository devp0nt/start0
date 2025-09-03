import { Logger0 } from "@ideanick/modules/lib/logger0.sh"

Logger0.rootTagPrefix = "gen0"
export class Gen0Logger {
  static init(debugConfig: string | boolean = false) {
    return Logger0.init({
      debugConfig:
        typeof debugConfig === "string"
          ? debugConfig
              .split(",")
              .map((tag) => `gen0:${tag}`)
              .join(",")
          : `gen0:*`,
      lowestLevel: debugConfig === false ? "info" : "debug",
      formatter: debugConfig === false ? "justMessage" : "pretty",
    })
  }

  static create(tagPrefix: string) {
    return Logger0.create({
      meta: {
        tagPrefix,
      },
      skipInit: true,
    })
  }
}
