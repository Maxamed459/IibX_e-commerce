import type { Metadata } from "next"; import "./globals.css"; import { Providers } from "@/components/providers"; import { SiteHeader } from "@/components/site-header"; import { SiteFooter } from "@/components/site-footer";
export const metadata:Metadata={title:"Thread/Form — Modern Everyday Fashion",description:"Considered essentials for your everyday wardrobe."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><Providers><SiteHeader/><main className="min-h-[60vh]">{children}</main><SiteFooter/></Providers></body></html>}
