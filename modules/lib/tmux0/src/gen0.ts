import type { Gen0ClientProcessCtx } from "@devp0nt/gen0/clientProcessCtx"
import type { Gen0Plugin } from "@devp0nt/gen0/plugin"
import { type GenerateConfig, generateTmuxCommands } from "./index"

export default {
  name: "tmux0",
  fns: {
    generateTmuxCommands: (
      ctx: Gen0ClientProcessCtx,
      config: GenerateConfig,
      indent: string = "",
      prepend: string = "",
    ) => {
      const cmds = generateTmuxCommands(config)
      if (prepend) {
        ctx.print(prepend)
      }
      cmds.map((cmd) => ctx.print(`${indent}${cmd}`))
    },
  },
} satisfies Gen0Plugin.DefinitionResult
