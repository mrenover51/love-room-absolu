import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { MobileAdminNav } from "@/components/admin/mobile-admin-nav";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Administration | Absolu", robots: { index: false, follow: false, noarchive: true, nosnippet: true } };
export default function AdminLayout({ children }: { children: React.ReactNode }) { return <div className="min-h-screen bg-[#090909] pb-20 text-[#F6F2EC] lg:pb-0"><AdminHeader /><div className="border-b border-[#C9A86A]/20 bg-[#C9A86A]/8 px-5 py-2 text-center text-xs text-[#D8C8B6]">La synchronisation iCal peut comporter un délai. Un channel manager pourra être connecté ultérieurement.</div><div className="grid lg:grid-cols-[260px_minmax(0,1fr)]"><AdminSidebar /><main className="min-w-0 p-3 sm:p-6 xl:p-8"><div className="mx-auto max-w-[1600px]">{children}</div></main></div><MobileAdminNav /></div>; }
