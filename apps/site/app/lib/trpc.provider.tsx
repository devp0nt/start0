import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { useState } from "react";
import { TRPCProvider as TRPCProviderOriginal } from "./trpc.utils";
import type { BackendTrpcRouter } from "@shmoject/backend/router/index.trpc";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export const TRPCProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() =>
    createTRPCClient<BackendTrpcRouter.TrpcRouter>({
      links: [
        httpBatchLink({
          url: `http://localhost:3075`,
        }),
      ],
    })
  );
  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProviderOriginal trpcClient={trpcClient} queryClient={queryClient}>
        {children}
      </TRPCProviderOriginal>
    </QueryClientProvider>
  );
};
