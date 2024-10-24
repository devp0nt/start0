import { useParams as useReactRouterParams } from 'react-router-dom'
import type { RoutyRoute } from 'svag-routy'

export const useRouteParams = <T extends RoutyRoute<any>>(route: T) => {
  const routeParams = useReactRouterParams()
  return {
    routeParams: route.parseParams(routeParams) as ReturnType<T['parseParams']>,
  }
}
