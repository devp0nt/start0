import { ErroryUnexpected } from '@/general/src/other/errory.js'

export function throwFalsy<T>(value: T): asserts value is NonNullable<T> {
  if (!value) {
    throw new ErroryUnexpected('Falsy value')
  }
}
