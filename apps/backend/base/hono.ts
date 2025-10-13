import type { Context as HonoContext } from 'hono'
import type { OpenAPIHono } from '@hono/zod-openapi'
import type { Ctx0 } from '@devp0nt/ctx0'

export type AnyHonoReqCtx = Ctx0.Value | Ctx0.Proxy
export type AnyHonoSettings<THonoReqCtx extends AnyHonoReqCtx = AnyHonoReqCtx> = {
  Variables: { honoReqCtx: THonoReqCtx } & Ctx0.InferValue<THonoReqCtx>
}
export type AnyHonoCtx<THonoReqCtx extends AnyHonoReqCtx = AnyHonoReqCtx> = HonoContext<AnyHonoSettings<THonoReqCtx>>
export type AnyHonoBase<THonoReqCtx extends AnyHonoReqCtx = AnyHonoReqCtx> = OpenAPIHono<AnyHonoSettings<THonoReqCtx>>
