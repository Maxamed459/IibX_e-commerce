"use client";
import { Provider } from "react-redux";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { store, hydrateAuth } from "@/lib/store";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000, gcTime: 5 * 60_000, refetchOnWindowFocus: false, retry: 1 } },
  }));
  useEffect(() => {
    const accessToken = localStorage.getItem("fashion_access");
    const refreshToken = localStorage.getItem("fashion_refresh");
    let user = null;
    try { user = JSON.parse(localStorage.getItem("fashion_user") || "null"); } catch { user = null; }
    store.dispatch(hydrateAuth({ accessToken, refreshToken, user }));
  }, []);
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </QueryClientProvider>
    </Provider>
  );
}
