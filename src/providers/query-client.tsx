"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const client = new QueryClient();

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={client}>
      {children}
      {/* remove in prod if you want */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
