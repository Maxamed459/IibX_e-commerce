"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Minus, Plus, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { useProductQuery, useAddCartItemMutation } from "@/lib/api";
import { money } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: p, isLoading, isError } = useProductQuery(id);
  const [qty, setQty] = useState(1);
  const [add, { isLoading: adding }] = useAddCartItemMutation();
  const [message, setMessage] = useState("");
  async function addToCart() {
    if (!p || p.stock < 1) {
      setMessage("This product is out of stock.");
      return;
    }
    if (qty < 1 || qty > p.stock) {
      setMessage(`Choose a quantity between 1 and ${p.stock}.`);
      return;
    }
    setMessage("");
    try {
      await add({ product_id: p.id, quantity: qty }).unwrap();
    } catch {
      setMessage("Could not add this item. Please sign in and try again.");
    }
  }
  if (isLoading)
    return <div className="mx-auto max-w-7xl px-4 py-20">Loading product…</div>;
  if (isError || !p)
    return (
      <div className="mx-auto max-w-7xl px-4 py-20">
        <p>Product not found.</p>
        <Link href="/shop" className="mt-4 inline-block underline">
          Back to shop
        </Link>
      </div>
    );
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link
        href="/shop"
        className="mb-8 inline-flex items-center gap-2 text-sm text-neutral-500"
      >
        <ArrowLeft size={16} /> Back to shop
      </Link>
      <div className="grid gap-10 md:grid-cols-2">
        <div className="overflow-hidden rounded-[2rem] bg-neutral-100">
          {p.image ? (
            <img
              src={p.image}
              alt={p.name}
              className="aspect-[4/5] w-full object-cover"
            />
          ) : (
            <div className="flex aspect-[4/5] items-center justify-center bg-gradient-to-br from-stone-200 to-neutral-100 text-xs uppercase tracking-[.3em] text-neutral-500">
              Thread / Form
            </div>
          )}
        </div>
        <div className="flex flex-col justify-center py-4 md:py-12">
          <Badge>Everyday collection</Badge>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">
            {p.name}
          </h1>
          <p className="mt-3 text-xl">{money(p.price)}</p>
          <p className="mt-6 whitespace-pre-line leading-7 text-neutral-600">
            {p.description ||
              "A considered essential, designed for effortless everyday wear."}
          </p>
          <p className="mt-6 text-sm text-neutral-500">
            {p.stock > 0 ? `${p.stock} available` : "Currently out of stock"}
          </p>
          <div className="mt-8 flex items-center gap-3">
            <div className="flex h-11 items-center rounded-xl border border-neutral-300">
              <button
                className="px-3"
                aria-label="Decrease quantity"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                <Minus size={15} />
              </button>
              <span className="w-8 text-center text-sm">{qty}</span>
              <button
                className="px-3"
                aria-label="Increase quantity"
                onClick={() => setQty((q) => Math.min(p.stock, q + 1))}
                disabled={qty >= p.stock || p.stock < 1}
              >
                <Plus size={15} />
              </button>
            </div>
            <Button
              size="lg"
              className="flex-1"
              disabled={adding || p.stock < 1 || qty > p.stock}
              onClick={addToCart}
            >
              <ShoppingBag size={17} />
              {adding ? "Adding…" : "Add to bag"}
            </Button>
          </div>
          {message && (
            <p role="alert" className="mt-3 text-sm text-red-600">
              {message}
            </p>
          )}
          <div className="mt-8 border-t border-neutral-200 pt-5 text-sm text-neutral-500">
            Secure checkout · Easy everyday styling · Stock confirmed at
            checkout
          </div>
        </div>
      </div>
    </section>
  );
}
