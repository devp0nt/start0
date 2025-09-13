import { Error0 } from "@devp0nt/error0"
import { useMemo } from "react"
import { type ErrorResponse, isRouteErrorResponse } from "react-router"

export namespace SiteError {
  export type Type = Error0 | ErrorResponse | Error | Error0.JSON | string | unknown

  export const useError0 = (error: Type) => {
    return useMemo(() => Error0.from(isRouteErrorResponse(error) ? error.data : error), [error])
  }

  export const CleanComponent = ({ message, desc, stack }: { message: string; desc?: string; stack?: string }) => {
    return (
      <main className="pt-16 p-4 container mx-auto">
        <h1>{message || "Unknown error"}</h1>
        {desc && <p>{desc}</p>}
        {stack && (
          <pre className="w-full p-4 overflow-x-auto">
            <code>{stack}</code>
          </pre>
        )}
      </main>
    )
  }

  export const CleanPage = ({ message, desc, stack }: { message: string; desc?: string; stack?: string }) => {
    return <CleanComponent message={message} desc={desc} stack={stack} />
  }

  export const Page = ({ error, desc }: { error: Type; desc?: string }) => {
    const error0 = useError0(error)
    return <CleanPage message={error0.message} desc={desc} stack={error0.stack} />
  }

  export const Component = ({ error, desc }: { error: Type; desc?: string }) => {
    const error0 = useError0(error)
    return <CleanComponent message={error0.message} desc={desc} stack={error0.stack} />
  }

  export const Page404 = () => {
    return <CleanPage message="Page Not Found" desc="The page you are looking for does not exist." />
  }
}
