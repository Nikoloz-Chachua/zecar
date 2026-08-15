import type { Metadata } from "next";
import { AdminLanguageSync } from "@/components/admin/language-sync";
export const metadata:Metadata={title:{absolute:"Private analytics | ZECAR"},robots:{index:false,follow:false}};
export default function AdminLayout({children}:{children:React.ReactNode}){return <main className="admin-root"><AdminLanguageSync/>{children}</main>}
