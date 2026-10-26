import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/store";
import type { Order } from "@/lib/types";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

export function useCachedMyOrders() {
  const auth = useSelector((state: RootState) => state.auth);
  return useQuery<Order[]>({
    queryKey: ["my-orders", auth.user?.id ?? "current-user"],
    enabled: auth.hydrated && !!auth.accessToken,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    queryFn: async () => {
      const response = await fetch(`${baseUrl}/orders/mine/`, {
        headers: { Accept: "application/json", Authorization: `Bearer ${auth.accessToken}` },
        credentials: "include",
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        const detail = payload && typeof payload === "object" && "detail" in payload ? String(payload.detail) : `Unable to load orders (${response.status})`;
        throw new Error(detail);
      }
      return Array.isArray(payload) ? payload as Order[] : (payload?.results ?? []) as Order[];
    },
  });
}
