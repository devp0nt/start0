import { Error0 } from "@shmoject/modules/lib/error0"
import { GeneralLayout } from "@shmoject/site/components/GeneralLayout"
import { TRPCReactProvider } from "@shmoject/site/lib/trpc"
import { TRPCClientError } from "@trpc/client"
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router"
import type { Route } from "./+types/root"

// const TRPCReactProvider = ({ children }: { children: React.ReactNode }) => {
//   return <>{children}</>;
// };

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
      <Outlet />
    </TRPCReactProvider>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const error0 = Error0.from(error)

  return (
    <GeneralLayout>
      <main className="pt-16 p-4 container mx-auto">
        <h1>{error0.message || "Unknown error"}</h1>
        <p>{error0.clientMessage || error0.message || "Sorry"}</p>
        <p>{error0.code || "—"}</p>
        {/* {error0.stack && (
          <pre className="w-full p-4 overflow-x-auto">
            <code>{error0.stack}</code>
          </pre>
        )} */}
      </main>
    </GeneralLayout>
  )
}
