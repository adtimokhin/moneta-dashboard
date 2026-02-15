"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const client = new QueryClient({
  defaultOptions: {
    queries: {
      // SWR core:
      staleTime: 5 * 60_000, // data is "fresh" for 5 min (no re-fetch on re-render)
      gcTime: 30 * 60_000, // keep cache 30 min in memory
      refetchOnWindowFocus: true, // revalidate when user focuses tab
      refetchOnReconnect: true, // revalidate when network reconnects
      retry: 2, // retry transient errors
    },
    mutations: {
      retry: 1,
    },
  },
});

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={client}>
      {children}
      {process.env.NODE_ENV !== "production" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
