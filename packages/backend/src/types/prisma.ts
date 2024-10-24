// import type {
//   Something as ImportedSomething,
// } from '@svagatron/general/src/something/utils.shared.js'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace PrismaJson {
    // type Something = ImportedSomething
  }
}

export {}
