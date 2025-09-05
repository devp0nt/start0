import { SiteError } from "apps/site/src/components/Error"
import { GeneralLayout } from "apps/site/src/components/GeneralLayout"
import { SiteCtx } from "apps/site/src/lib/ctx"
import { TRPCReactProvider } from "apps/site/src/lib/trpc"
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router"
import { RR0 } from "@/site/react-router/utils"
import type { Route } from "./+types/root"

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
]

export const unstable_middleware = [SiteCtx.rrMiddleware]

// keep this loader to hydrate query client with siteCtx
// so on page error, we still have siteCtx
export const loader = RR0.createLoader(async ({ qc, context }: RR0.LoaderArgs<Route.LoaderArgs>) => {
  return {}
})

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return (
    <TRPCReactProvider>
      <SiteCtx.Provider>
        <Outlet />
      </SiteCtx.Provider>
    </TRPCReactProvider>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <GeneralLayout>
      <SiteError.Page error={error} />
    </GeneralLayout>
  )
}
