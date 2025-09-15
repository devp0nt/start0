import { Route0 } from '@devp0nt/route0'

export namespace siteRoutes {
  export const base = Route0.create('/&ref')
  export const home = base
  export const ideasBase = base.extend('/ideas')
  export const ideasList = ideasBase
  export const ideaView = ideasBase.extend('/:sn')
}
