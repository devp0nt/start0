import nodeFs from "node:fs"
import nodePath from "node:path"
import vm from "node:vm"
import type { Gen0Client } from "@ideanick/tools/gen0/client"
import type { Gen0Fs } from "@ideanick/tools/gen0/fs"
import _ from "lodash"

// TODO: add lines numbers to stack trace

export class Gen0ClientProcessCtx {
  client: Gen0Client
  fns: Gen0ClientProcessCtx.FnsRecord
  vars: Gen0ClientProcessCtx.VarsRecord

  fs: Gen0Fs
  $: Gen0ClientProcessCtx.Store = {}

  nodeFs: Gen0ClientProcessCtx.NodeFs = nodeFs
  nodePath: Gen0ClientProcessCtx.NodePath = nodePath
  _: Gen0ClientProcessCtx.Lodash = _
  console: Gen0ClientProcessCtx.Console = console
  logger: Gen0ClientProcessCtx.Logger = console
  // biome-ignore lint/suspicious/noConsole: <x>
  log: Gen0ClientProcessCtx.LoggerLog = console.log.bind(console)

  // TODO: selfPath.name,.ext,...
  selfPath: string
  selfName: string
  selfExt: string
  selfExtDotted: string
  selfBasename: string
  selfDir: string
  selfDirName: string

  prints: string[] = []

  private constructor({ client }: { client: Gen0Client }) {
    this.client = client
    this.fs = this.client.file.fs
    this.fns = this.client.config.fns
    this.vars = this.client.config.vars
    this.selfPath = this.client.file.path.abs
    this.selfName = this.client.file.path.name
    this.selfExt = this.client.file.path.ext
    this.selfExtDotted = this.client.file.path.extDotted
    this.selfBasename = this.client.file.path.basename
    this.selfDir = this.client.file.path.dir
    this.selfDirName = this.client.file.path.dirname
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

  async execScript(scriptContent: string) {
    const runnerCtx = this.getSelfWithFnsAndVars()
    const vmContex = vm.createContext(runnerCtx)
    const wrappedScript = `
      ;(async () => {
        try {
          ${scriptContent}
        } catch (error) {
          console.error(\`Error in "${this.selfPath}"\`)
          // console.error(error)
          // console.log("Stacktrace:", error.stack)
          throw error
        }
      })()
    `
    await vm.runInContext(wrappedScript, vmContex)
    const printed = this.getPrinted()
    this.clearPrints()
    return { printed }
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
