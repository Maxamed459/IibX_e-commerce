"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { ShoppingBag, Menu, UserRound, LogOut } from "lucide-react";
import { useCartQuery } from "@/lib/api";
import { Button } from "@/components/ui/button";
import type { RootState } from "@/lib/store";
export function SiteHeader() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const auth = useSelector((s: RootState) => s.auth);
  const { data } = useCartQuery(undefined, {
    skip: isAdmin || !auth.hydrated || !auth.accessToken,
  });
  const count = data?.items?.reduce((n, i) => n + i.quantity, 0) ?? 0;
  if (isAdmin) return null;
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-xl font-black tracking-[.16em]">
          THREAD<span className="text-neutral-400">/</span>FORM
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-neutral-600 md:flex">
          <Link href="/shop" className="hover:text-black">
            Shop all
          </Link>
          <Link href="/shop?category=women" className="hover:text-black">
            Women
          </Link>
          <Link href="/shop?category=men" className="hover:text-black">
            Men
          </Link>
          <Link href="/orders" className="hover:text-black">
            My orders
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="icon" aria-label="Account">
              {auth.user ? <UserRound size={19} /> : <LogOut size={19} />}
            </Button>
          </Link>
          <Link href="/cart" className="relative">
            <Button variant="ghost" size="icon" aria-label="Shopping cart">
              <ShoppingBag size={19} />
            </Button>
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[10px] text-white">
                {count}
              </span>
            )}
          </Link>
          <Link href="/shop" className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Shop">
              <Menu size={19} />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
