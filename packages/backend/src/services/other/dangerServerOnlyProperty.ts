import { ErroryUnexpected } from '@/general/src/other/errory.js'
import { deepMap } from 'svag-deep-map'

export const throwOnDangerServerOnlyProperty = (data: any) => {
  deepMap(data, ({ value, path }) => {
    if (value && typeof value === 'object' && 'dangerServerOnlyProperty' in value) {
      throw new ErroryUnexpected(`Dangerous server only property found, please contact the developer: ${path}`)
    }
    return value
  })
}
