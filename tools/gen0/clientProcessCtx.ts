import nodeFs from "node:fs"
import nodePath from "node:path"
import vm from "node:vm"
import type { Gen0Client } from "@ideanick/tools/gen0/client"
import type { Gen0Fs } from "@ideanick/tools/gen0/fs"
import { Gen0Logger } from "@ideanick/tools/gen0/logger"
import _ from "lodash"

export class Gen0ClientProcessCtx {
  static logger = Gen0Logger.create("clientProcessCtx")
  logger = Gen0ClientProcessCtx.logger

  client: Gen0Client
  fns: Gen0ClientProcessCtx.FnsRecord
  vars: Gen0ClientProcessCtx.VarsRecord

  fs: Gen0Fs
  $: Gen0ClientProcessCtx.Store = {}
  path: Gen0Fs.PathParsed

  nodeFs: Gen0ClientProcessCtx.NodeFs = nodeFs
  nodePath: Gen0ClientProcessCtx.NodePath = nodePath
  _: Gen0ClientProcessCtx.Lodash = _
  console: Gen0ClientProcessCtx.Console = console
  // biome-ignore lint/suspicious/noConsole: <x>
  log: Gen0ClientProcessCtx.LoggerLog = console.log.bind(console)

  prints: string[] = []

  private constructor({ client }: { client: Gen0Client }) {
    this.client = client
    this.fs = this.client.file.fs
    this.fns = this.client.pluginsManager.getFnsRecord()
    this.vars = this.client.pluginsManager.getVarsRecord()
    this.path = this.client.file.path
  }

  static create({ client }: { client: Gen0Client }) {
    return new Gen0ClientProcessCtx({ client })
  }

  print: Gen0ClientProcessCtx.Print = (str: string) => {
    this.prints.push(str)
  }

  printInline: Gen0ClientProcessCtx.PrintInline = (str: string) => {
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

  // getSelfWithFnsAndVars() {
  //   const proxy = new Proxy(this, {
  //     get: (target, prop, receiver) => {
  //       if (prop in this.vars) {
  //         return this.vars[prop as keyof typeof this.vars]
  //       }

  //       if (prop in this.fns) {
  //         const fn = this.fns[prop as keyof typeof this.fns]
  //         if (typeof fn === "function") {
  //           return fn.bind(this)
  //         }
  //         return fn
  //       }

  //       const value = Reflect.get(target, prop, receiver)
  //       if (typeof value === "function") {
  //         return (value as Function).bind(this)
  //       }
  //       return value
  //     },
  //   })
  //   return proxy
  // }

  getSelfWithFnsAndVars() {
    // Base: copy all instance props
    const ctx: Record<string, any> = {}

    // Copy instance fields and bind functions
    // for (const key of Object.getOwnPropertyNames(Object.getPrototypeOf(this))) {
    //   const value = (this as any)[key]
    //   if (typeof value === "function" && Gen0ClientProcessCtx.bindableMethods.includes(key)) {
    //     ctx[key] = value.bind(this)
    //   }
    // }

    // for (const [key, value] of Object.entries(this)) {
    //   if (typeof value === "function" && Gen0ClientProcessCtx.bindableMethods.includes(key)) {
    //     ctx[key] = value.bind(this)
    //   } else {
    //     ctx[key] = value
    //   }
    // }

    // Vars override
    for (const [key, value] of Object.entries(this.vars)) {
      ctx[key] = value
    }

    // Fns override (bind if function)
    for (const [key, value] of Object.entries(this.fns)) {
      ctx[key] = typeof value === "function" ? value.bind(this, this) : value
    }

    for (const [key, value] of Object.entries(this)) {
      ctx[key] = value
    }

    return ctx
  }

  getVmErrorData(error: unknown): Gen0ClientProcessCtx.NormalizedVmError {
    // TODO: do it good. Replace stack
    // TODO: offset also column position
    if (error instanceof Error) {
      return error
    }
    if (typeof error !== "object" || error === null) {
      const e = new Error("Unknown terrible error")
      ;(e as any).stack = this.path.abs
      return e
    }
    // const message = "message" in error && typeof error.message === "string" ? error.message : "Unknown error"
    const stack = "stack" in error && typeof error.stack === "string" ? error.stack : undefined
    const normalizedStack = stack
      ?.split("\n")
      .map((line) => {
        return line.replace("evalmachine.<anonymous>", `${this.path.abs}`)
        // .replace("file:///:", `${this.path.abs}:`)
      })
      .join("\n")
    ;(error as any).stack = normalizedStack
    return error as Error
  }

  async execScript(scriptContent: string, lineOffset: number = 0) {
    // TODO: return error, if error occured
    const runnerCtx = this.getSelfWithFnsAndVars()
    const vmContex = vm.createContext(runnerCtx)
    let error: Gen0ClientProcessCtx.NormalizedVmError | undefined
    const wrappedScript = `
      ;(async () => {
        try {
          ${scriptContent}
        } catch (error) {
          throw error
        }
      })()
    `
    const wrapperScriptOffset = 3
    try {
      await vm.runInContext(wrappedScript, vmContex, {
        lineOffset: lineOffset - wrapperScriptOffset,
      })
    } catch (e) {
      error = this.getVmErrorData(e)
    }
    const printed = this.getPrinted()
    this.clearPrints()
    return { printed, error }
  }

  async execFn<TArgs extends any[] = any[], TReturn = any>(
    fn: Gen0ClientProcessCtx.Fn<TArgs, TReturn>,
    ...args: TArgs
  ) {
    const result = await fn(this, ...args)
    const printed = this.getPrinted()
    this.clearPrints()
    return { result, printed }
  }
}

export namespace Gen0ClientProcessCtx {
  // export type NormalizedVmError = { message: string; stack: string | undefined }
  export type NormalizedVmError = Error
  export type Lodash = typeof _
  export type Store = Record<string, any>
  export type Console = typeof console
  export type Logger = typeof console
  export type LoggerLog = typeof console.log
  export type Print = (str: string) => void
  export type PrintInline = (str: string) => void
  export type Fn<TArgs extends any[] = any[], TReturn = any> = (ctx: Gen0ClientProcessCtx, ...args: TArgs) => TReturn
  export type FnsRecord = Record<string, Fn>
  export type Var = any
  export type VarsRecord = Record<string, Var>
  export type NodeFs = typeof nodeFs
  export type NodePath = typeof nodePath
}
