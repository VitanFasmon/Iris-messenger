import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

const client = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 5,
      refetchOnWindowFocus: true,
    },
  },
});

export const QueryProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};
