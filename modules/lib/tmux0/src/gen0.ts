import type { Gen0ClientProcessCtx } from "@devp0nt/gen0/clientProcessCtx"
import type { Gen0Plugin } from "@devp0nt/gen0/plugin"
import { type GenerateConfig, generateTmuxCommands } from "./index"

export default {
  name: "tmux0",
  fns: {
    generateTmuxCommands: (ctx: Gen0ClientProcessCtx, config: GenerateConfig) => {
      const cmds = generateTmuxCommands(config)
      cmds.map(ctx.print)
    },
  },
} satisfies Gen0Plugin.DefinitionResult
