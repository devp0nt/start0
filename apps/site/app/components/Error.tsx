import { Error0 } from "@shmoject/modules/lib/error0"
import { useMemo } from "react"
import { type ErrorResponse, isRouteErrorResponse } from "react-router"

export const useError0 = (
  error: Error0 | ErrorResponse | Error | Error0.JSON | unknown,
) => {
  return useMemo(
    () => Error0.from(isRouteErrorResponse(error) ? error.data : error),
    [error],
  )
}

export const ErrorPage = ({
  error,
}: {
  error: Error0 | ErrorResponse | Error | Error0.JSON | unknown
}) => {
  const error0 = useError0(error)
  return <ErrorComponent error={error0} />
}

export const ErrorComponent = ({
  error,
}: {
  error: Error0 | ErrorResponse | Error | Error0.JSON | unknown
}) => {
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
