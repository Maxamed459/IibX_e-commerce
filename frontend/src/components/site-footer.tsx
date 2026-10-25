"use client";
import { usePathname } from "next/navigation";
export function SiteFooter(){const pathname=usePathname();if(pathname.startsWith("/admin"))return null;return <footer className="mt-20 border-t border-neutral-200"><div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-neutral-500 sm:flex-row sm:items-center sm:justify-between"><span className="font-bold tracking-widest text-neutral-900">THREAD/FORM</span><span>Considered essentials. Made for everyday.</span><span>© {new Date().getFullYear()} Thread/Form</span></div></footer>}
