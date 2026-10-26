"use client";
import { FormEvent, useState } from "react";
import {
  useAddressesQuery,
  useCreateAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getErrorMessage } from "@/lib/utils";
export default function AddressesPage() {
  const { data: addresses = [], isLoading } = useAddressesQuery();
  const [create, { isLoading: saving }] = useCreateAddressMutation();
  const [remove] = useDeleteAddressMutation();
  const [setDefaultAddress] = useSetDefaultAddressMutation();
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    address_type: "",
    street_address: "",
    city: "",
    state: "",
    postal_code: "",
    country: "Somalia",
    is_default: true,
  });
  const [message, setMessage] = useState("");
  function change(k: keyof typeof form, v: string | boolean) {
    setForm((s) => ({ ...s, [k]: v }));
  }
  async function submit(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    try {
      const shouldBeDefault = form.is_default || addresses.length === 0;
      const created = await create({ ...form, is_default: false }).unwrap();
      if (shouldBeDefault) await setDefaultAddress(created.id).unwrap();
      setForm((s) => ({
        ...s,
        full_name: "",
        phone: "",
        address_type: "",
        street_address: "",
        city: "",
        state: "",
        postal_code: "",
        is_default: false,
      }));
    } catch (err) {
      setMessage(getErrorMessage(err));
    }
  }
  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-[1fr_1fr]">
      <div>
        <p className="text-xs uppercase tracking-[.25em] text-neutral-500">
          Your account
        </p>
        <h1 className="mt-2 text-4xl font-semibold">Saved addresses</h1>
        <div className="mt-6 space-y-3">
          {isLoading ? (
            <p>Loading…</p>
          ) : (
            addresses.map((a) => (
              <Card key={a.id}>
                <CardContent className="flex justify-between gap-3 p-4">
                  <div className="text-sm">
                    <p className="font-medium">
                      {a.full_name}{" "}
                      {a.is_default && (
                        <span className="ml-1 text-xs text-neutral-500">
                          · Default
                        </span>
                      )}
                    </p>
                    <p className="mt-1 text-neutral-500">
                      {a.address_line_1}, {a.city}, {a.country}
                    </p>
                    <p className="text-neutral-500">{a.phone}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(a.id)}
                  >
                    Remove
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Add an address</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid gap-3">
            {(
              [
                ["full_name", "Full name"],
                ["phone", "Phone"],
                ["address_type", "Address Type"],
                ["street_address", "Street Address"],
                ["city", "City"],
                ["state", "State / region"],
                ["postal_code", "Postal code"],
                ["country", "Country"],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                <label className="mb-1.5 block text-sm">{label}</label>
                <Input
                  required={[
                    "full_name",
                    "phone",
                    "address_line_1",
                    "city",
                    "country",
                  ].includes(key)}
                  value={form[key]}
                  onChange={(e) => change(key, e.target.value)}
                />
              </div>
            ))}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_default}
                onChange={(e) => change("is_default", e.target.checked)}
              />{" "}
              Set as default
            </label>
            {message && <p className="text-sm text-red-600">{message}</p>}
            <Button disabled={saving || isLoading}>
              {saving ? "Saving…" : "Save address"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
