import vm from "node:vm"
import { Gen0Fs } from "@ideanick/tools/gen0/fs"
import _ from "lodash"

export class Gen0ClientCtx {
  fns: Gen0ClientCtx.Fns = {}
  vars: Gen0ClientCtx.Vars = {}

  fs: Gen0Fs
  $: Gen0ClientCtx.Store = {}

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

  private constructor({ clientPath, rootDir }: { clientPath: string; rootDir: string }) {
    this.fs = Gen0Fs.create({ rootDir, filePath: clientPath })
    const pathParsed = this.fs.parsePath(clientPath)
    this.selfPath = pathParsed.abs
    this.selfName = pathParsed.name
    this.selfExt = pathParsed.ext
    this.selfExtDotted = pathParsed.extDotted
    this.selfBasename = pathParsed.basename
    this.selfDir = pathParsed.dir
    this.selfDirName = pathParsed.dirname
  }

  static create({ clientPath, rootDir }: { clientPath: string; rootDir: string }) {
    return new Gen0ClientCtx({ clientPath, rootDir })
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

  clearPrints() {
    this.prints = []
  }

  getSelfWithFnsAndVars() {
    const proxy = new Proxy(this, {
      get: (target, prop, receiver) => {
        if (prop in this.vars) {
          return this.vars[prop as keyof typeof this.vars]
        }

        if (prop in this.fns) {
          const fn = this.fns[prop as keyof typeof this.fns]
          if (typeof fn === "function") {
            return fn.bind(this)
          }
          return fn
        }

        const value = Reflect.get(target, prop, receiver)
        if (typeof value === "function") {
          return (value as Function).bind(this)
        }
        return value
      },
    })
    return proxy
  }

  async execScript(scriptContent: string) {
    const runnerCtx = this.getSelfWithFnsAndVars()
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
    const printed = this.getPrinted()
    this.clearPrints()
    return { printed }
  }

  async execFn<TArgs extends any[] = any[], TReturn = any>(fn: Gen0ClientCtx.Fn<TArgs, TReturn>, ...args: TArgs) {
    const result = await fn(this, ...args)
    const printed = this.getPrinted()
    this.clearPrints()
    return { result, printed }
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
  export type Fn<TArgs extends any[] = any[], TReturn = any> = (ctx: Gen0ClientCtx, ...args: TArgs) => TReturn
  export type Fns = Record<string, Fn>
  export type Var = any
  export type Vars = Record<string, Var>
}
