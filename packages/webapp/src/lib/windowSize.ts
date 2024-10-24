import { createStorik } from '@/webapp/src/lib/storik.js'
import { createWindowSizeThings } from 'svag-window-size'

export const { WindowSizeWatcher, useValueByWindowSize, useWindowSize, windowSizes } = createWindowSizeThings({
  sizes: {
    mobile: 420,
    tablet: 1_200,
    desktop: Infinity,
  },
  ssr: true,
  createStorik,
})
