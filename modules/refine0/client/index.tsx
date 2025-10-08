import { createRefine0, type CreateRefine0Result } from '@devp0nt/refine0/client/utils'
import type { AxiosInstance } from 'axios'

export class Refine0 {
  openapiUrl: string
  apiUrl: string
  apiPathPrefix: string | undefined
  httpClient: AxiosInstance

  useStore: CreateRefine0Result['useRefine0Store']
  useRefineResources: CreateRefine0Result['useRefine0RefineResources']
  useResource: CreateRefine0Result['useRefine0Resource']
  useAction: CreateRefine0Result['useRefine0Action']
  useResourceWithAction: CreateRefine0Result['useRefine0ResourceWithAction']
  dataProvider: CreateRefine0Result['dataProvider']
  Provider: CreateRefine0Result['Refine0Provider']

  private constructor(props: Parameters<typeof createRefine0>[0]) {
    const refine0 = createRefine0(props)

    this.apiUrl = props.apiUrl
    this.openapiUrl = props.openapiUrl
    this.httpClient = props.httpClient
    this.apiPathPrefix = props.apiPathPrefix

    this.useStore = refine0.useRefine0Store
    this.useRefineResources = refine0.useRefine0RefineResources
    this.useResource = refine0.useRefine0Resource
    this.useAction = refine0.useRefine0Action
    this.useResourceWithAction = refine0.useRefine0ResourceWithAction
    this.dataProvider = refine0.dataProvider
    this.Provider = refine0.Refine0Provider
  }

  static create = (props: Parameters<typeof createRefine0>[0]) => {
    return new Refine0(props)
  }
}

export { useRjsfJs, useRjsfUiSchema, useRjsfData } from '@devp0nt/refine0/client/utils'
