import { Route0 } from "@shmoject/modules/lib/route0.sh"

export namespace SiteRoutes {
  export const base = Route0.create("/")
  export const home = base
  export const ideasBase = base.extend("/ideas")
  export const ideasList = ideasBase
  export const ideaView = ideasBase.extend("/:sn")
}
