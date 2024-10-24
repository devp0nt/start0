import type { ExpressRequest } from '@/backend/src/types/other.js'
import { createStorikServerThings } from 'svag-storik/dist/server.js'

// TODO:ASAP try remove it

export const { applyStorikToExpressApp } = createStorikServerThings({
  getValue: (req: ExpressRequest, key) => {
    const cookie = req.cookies[key]
    return typeof cookie === 'string' ? cookie : undefined
  },
  setValue: (res, key, value) => {
    res.cookie(key, value, {
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
    })
  },
})
