"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BedDouble, CalendarDays, LayoutDashboard, MoreHorizontal, Users } from "lucide-react";
const items = [["Accueil", "/admin", LayoutDashboard], ["Calendrier", "/admin/calendrier", CalendarDays], ["Réservations", "/admin/reservations", BedDouble], ["Clients", "/admin/clients", Users], ["Plus", "/admin/parametres", MoreHorizontal]] as const;
export function MobileAdminNav() { const pathname = usePathname(); return <nav aria-label="Navigation mobile" className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-5 rounded-2xl border border-white/10 bg-[#101010]/95 p-1 shadow-2xl backdrop-blur-xl lg:hidden">{items.map(([label, href, Icon]) => { const active = href === "/admin" ? pathname === href : pathname.startsWith(href); return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[9px] ${active ? "bg-[#C9A86A]/15 text-[#E5C98E]" : "text-white/40"}`}><Icon className="size-4" />{label}</Link>; })}</nav>; }
