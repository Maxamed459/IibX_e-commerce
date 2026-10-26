"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCachedMyOrders } from "@/lib/queries";
import { money } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/store";
export default function OrdersPage() {
  const auth = useSelector((state: RootState) => state.auth);
  const params = useSearchParams();
  const created = params.get("created");
  const { data: orders = [], isLoading, isError, error } = useCachedMyOrders();
  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <p className="text-xs uppercase tracking-[.25em] text-neutral-500">
        Your account
      </p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">
        Order history
      </h1>
      {created && (
        <div
          role="status"
          className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-900"
        >
          Order placed successfully. Your order reference is{" "}
          <strong>{created}</strong>.
        </div>
      )}
      {!auth.hydrated || isLoading ? (
        <p className="py-10">Loading orders…</p>
      ) : !auth.accessToken ? (
        <p className="py-10 text-neutral-500">
          Please{" "}
          <Link href="/login" className="underline">
            sign in
          </Link>{" "}
          to view your orders.
        </p>
      ) : isError ? (
        <p className="py-10 text-neutral-500">
          {error instanceof Error
            ? error.message
            : "Sign in to view your orders."}
        </p>
      ) : !orders.length ? (
        <div className="py-16 text-center text-neutral-500">
          No orders yet.{" "}
          <Link href="/shop" className="underline">
            Explore the collection
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {orders.map((o) => (
            <Link href={`/orders/${o.id}`} key={o.id}>
              <Card className="transition hover:border-neutral-400 mb-3">
                <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                  <div>
                    <p className="font-medium">Order #{o.id.slice(0, 8)}</p>
                    <p className="mt-1 text-sm text-neutral-500">
                      {o.placed_at
                        ? new Date(o.placed_at).toLocaleDateString()
                        : "Recently placed"}
                    </p>
                  </div>
                  <Badge>{o.status}</Badge>
                  <div className="font-semibold">{money(o.total)}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
