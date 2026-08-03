"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getInternalLinkGroups } from "@/lib/seo/internal-links";

export function SmartContextLinks() {
  const pathname = usePathname();
  const groups = getInternalLinkGroups(pathname);
  return (
    <nav
      aria-label="Recommandations personnalisées"
      className="page-shell border-b border-white/10 pb-12"
    >
      <p className="eyebrow mb-8 text-white/35">Navigation contextuelle</p>
      <div className="grid gap-9 sm:grid-cols-3">
        {groups.map((group) => (
          <section key={group.title}>
            <h2 className="eyebrow text-[#C9A86A]">{group.title}</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </nav>
  );
}
