import { Error0 } from "@shmoject/modules/lib/error0.sh"
import { useMemo } from "react"
import { type ErrorResponse, isRouteErrorResponse } from "react-router"

export namespace SiteError {
  export type Type = Error0 | ErrorResponse | Error | Error0.JSON | unknown

  export const useError0 = (error: Type) => {
    return useMemo(() => Error0.from(isRouteErrorResponse(error) ? error.data : error), [error])
  }

  export const Page = ({ error }: { error: Type }) => {
    const error0 = useError0(error)
    return <Component error={error0} />
  }

  export const Component = ({ error }: { error: Type }) => {
    const error0 = useError0(error)
    return (
      <main className="pt-16 p-4 container mx-auto">
        <h1>{error0.message || "Unknown error"}</h1>
        <p>{error0.clientMessage || error0.message || "Sorry"}</p>
        <p>{error0.code || "—"}</p>
        {error0.stack && (
          <pre className="w-full p-4 overflow-x-auto">
            <code>{error0.stack}</code>
          </pre>
        )}
      </main>
    )
  }
}
