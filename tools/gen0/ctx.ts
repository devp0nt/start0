import vm from "node:vm"
import { Gen0Fs } from "@ideanick/tools/gen0/fs"
import _ from "lodash"

export class Gen0ClientCtx {
  fs: Gen0Fs
  $: Gen0ClientCtx.Store = {}
  fns: Gen0ClientCtx.GlobalFns = {}

  _: Gen0ClientCtx.Lodash = _
  console: Gen0ClientCtx.Console = console
  logger: Gen0ClientCtx.Logger = console
  // biome-ignore lint/suspicious/noConsole: <x>
  log: Gen0ClientCtx.LoggerLog = console.log.bind(console)

  selfPath: string
  selfName: string
  selfExt: string
  selfExtDotted: string
  selfBasename: string
  selfDir: string
  selfDirName: string

  prints: string[] = []

  constructor({ clientPath, rootDir }: { clientPath: string; rootDir: string }) {
    this.fs = new Gen0Fs({ rootDir, filePath: clientPath })
    const pathParsed = this.fs.parsePath(clientPath)
    this.selfPath = pathParsed.pathAbs
    this.selfName = pathParsed.name
    this.selfExt = pathParsed.ext
    this.selfExtDotted = pathParsed.extDotted
    this.selfBasename = pathParsed.basename
    this.selfDir = pathParsed.dir
    this.selfDirName = pathParsed.dirname
  }

  print: Gen0ClientCtx.Print = (str: string) => {
    this.prints.push(str)
  }

  printInline: Gen0ClientCtx.PrintInline = (str: string) => {
    if (this.prints.length > 0) {
      this.prints[this.prints.length - 1] += str
    } else {
      this.prints.push(str)
    }
  }

  getPrinted() {
    return this.prints.join("\n")
  }

  getSelfWithFns() {
    const ctx = { ...this.fns, ...this }
    return new Proxy(ctx, {
      get: (target, prop, receiver) => {
        const value = Reflect.get(target, prop, receiver)
        if (typeof value === "function") {
          return value.bind(this) // always bind to the outer instance
        }
        return value
      },
    })
  }

  async execScript(scriptContent: string) {
    const runnerCtx = this.getSelfWithFns()
    const vmContex = vm.createContext(runnerCtx)
    const wrappedScript = `
      ;(async () => {
        try {
          ${scriptContent}
        } catch (error) {
          console.error(\`Error in "${this.selfPath}"\`)
          console.error(error)
          console.log("Stacktrace:", error.stack)
        }
      })()
    `
    await vm.runInContext(wrappedScript, vmContex)
    return this.getPrinted()
  }
}

export namespace Gen0ClientCtx {
  export type Lodash = typeof _
  export type Store = Record<string, any>
  export type Console = typeof console
  export type Logger = typeof console
  export type LoggerLog = typeof console.log
  export type Print = (str: string) => void
  export type PrintInline = (str: string) => void
  export type GlobalFn<TArgs extends any[] = any[], TReturn = any> = (ctx: Gen0ClientCtx, ...args: TArgs) => TReturn
  export type GlobalFns = Record<string, GlobalFn>
}
