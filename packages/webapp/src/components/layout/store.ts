import { createStorik } from '@/webapp/src/lib/storik.js'

export const layoutStorik = createStorik({
  defaultValue: {
    modalOpened: false,
    loading: false,
  },
})
