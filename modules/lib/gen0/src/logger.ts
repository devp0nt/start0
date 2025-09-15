/** biome-ignore-all lint/suspicious/noConsole: it is loggger */
import debugUtil from 'debug'

export class Gen0Logger {
  static rootTag = 'gen0'
  static debug: boolean | string = false
  selfTag: string

  constructor(selfTag: string) {
    this.selfTag = selfTag
  }

  static init(debug: boolean | string = false) {
    const normalizedDebug =
      debug === false
        ? ''
        : typeof debug === 'string'
          ? debug
              .split(',')
              .map((tag) => `gen0:${tag}`)
              .join(',')
          : `gen0:*`
    debugUtil.enable(normalizedDebug)
    Gen0Logger.debug = debug
  }

  static create(selfTag: string) {
    return new Gen0Logger(selfTag)
  }

  info: typeof console.info = (...args) => {
    console.info(...args)
  }
  debug: typeof console.debug = (...args) => {
    if (!this.isEnabledByDebug()) return
    console.debug(...args)
  }
  warn: typeof console.warn = (...args) => {
    console.warn(...args)
  }
  error: typeof console.error = (...args) => {
    console.error(...args)
  }

  isEnabledByDebug() {
    return debugUtil.enabled(`gen0:${this.selfTag}`)
  }

  isDebugDisabled() {
    return Gen0Logger.debug === false
  }
}
