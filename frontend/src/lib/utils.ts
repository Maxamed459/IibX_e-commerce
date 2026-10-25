import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
export function money(value: number | string | null | undefined) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value ?? 0)); }
export function getErrorMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "data" in error) {
    const data = (error as { data?: unknown }).data;
    if (data && typeof data === "object") {
      const obj = data as Record<string, unknown>;
      if (typeof obj.detail === "string") return obj.detail;
      return Object.entries(obj).map(([k,v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`).join(" · ");
    }
  }
  return "Something went wrong. Please try again.";
}
