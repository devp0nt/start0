import { generalAppConfig } from '@/general/src/other/generalAppConfig.js'
import { createStorikClientThings } from 'svag-storik/dist/client.js'

export const { createStorik, createStorikPrimitive } = createStorikClientThings({
  projectSlug: generalAppConfig.projectSlug,
})
