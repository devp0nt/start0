import type { Gen0Plugin } from '@devp0nt/gen0'
import { type GenerateConfig, generateTmuxCommands } from './index'

export default {
  name: 'tmux0',
  fns: {
    generateTmuxCommands: (
      ctx: any, // Gen0ClientProcessCtx,
      config: GenerateConfig,
      indent: string = '',
      prepend: string = '',
    ) => {
      const cmds = generateTmuxCommands(config)
      if (prepend) {
        ctx.print(prepend)
      }
      cmds.map((cmd) => ctx.print(`${indent}${cmd}`))
    },
  },
} satisfies Gen0Plugin.DefinitionResult
