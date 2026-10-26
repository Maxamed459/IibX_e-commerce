"use client";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAddressesQuery, useCheckoutMutation } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getErrorMessage } from "@/lib/utils";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
export default function CheckoutPage() {
  const { data: addresses = [], isLoading, isError } = useAddressesQuery();
  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState("cash");
  const [checkout, { isLoading: submitting }] = useCheckoutMutation();
  const [message, setMessage] = useState("");
  const router = useRouter();
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!address && addresses.length) {
      setAddress(addresses.find((a) => a.is_default)?.id ?? addresses[0].id);
    }
  }, [addresses, address]);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    if (isLoading) {
      setMessage("Please wait while your saved addresses load.");
      return;
    }
    if (isError) {
      setMessage("Could not load addresses. Please refresh or sign in again.");
      return;
    }
    if (!addresses.length) {
      setMessage("Please add a shipping address before placing an order.");
      return;
    }
    if (!address || !addresses.some((a) => a.id === address)) {
      setMessage("Please choose a valid shipping address.");
      return;
    }
    try {
      const order = await checkout({
        address_id: address,
        payment_method: payment,
      }).unwrap();
      await queryClient.invalidateQueries({ queryKey: ["my-orders"] });
      router.push(`/orders?created=${encodeURIComponent(order.id)}`);
    } catch (err) {
      setMessage(getErrorMessage(err));
    }
  }
  const submitDisabled =
    isLoading || isError || submitting || !addresses.length;
  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-xs uppercase tracking-[.25em] text-neutral-500">
        Almost yours
      </p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">Checkout</h1>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Shipping and payment</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Shipping address
              </label>
              {isLoading ? (
                <p className="text-sm text-neutral-500">Loading addresses…</p>
              ) : isError ? (
                <p className="text-sm text-red-600">
                  Could not load saved addresses. Please refresh or sign in
                  again.
                </p>
              ) : addresses.length ? (
                <div className="space-y-2">
                  {addresses.map((a) => (
                    <label
                      key={a.id}
                      className="flex cursor-pointer gap-3 rounded-xl border border-neutral-200 p-4"
                    >
                      <input
                        type="radio"
                        name="address"
                        value={a.id}
                        checked={address === a.id}
                        onChange={() => setAddress(a.id)}
                      />
                      <span className="text-sm">
                        <strong>{a.full_name}</strong>
                        <br />
                        {a.address_line_1}, {a.city}, {a.country}
                        {a.is_default && (
                          <span className="ml-2 text-xs text-neutral-500">
                            Default
                          </span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-neutral-500">
                  No saved addresses.{" "}
                  <Link href="/account/addresses" className="underline">
                    Add an address
                  </Link>{" "}
                  before checkout.
                </p>
              )}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">
                Payment method
              </label>
              <select
                value={payment}
                onChange={(e) => setPayment(e.target.value)}
                className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm"
              >
                <option value="cash">Cash on delivery</option>
                <option value="card">Card (requires payment provider integration)</option>
                <option value="mobile_money">Mobile money</option>
              </select>
            </div>
            {message && (
              <p role="alert" className="text-sm text-red-600">
                {message}
              </p>
            )}
            <Button className="w-full" disabled={submitDisabled}>
              {submitting
                ? "Placing order…"
                : isLoading
                  ? "Loading addresses…"
                  : "Place order"}
            </Button>
            <p className="text-xs leading-5 text-neutral-500">
              The server calculates the final total and validates product stock.
              Card payment will not work until a payment gateway is integrated.
            </p>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
