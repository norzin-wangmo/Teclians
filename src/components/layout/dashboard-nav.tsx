"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = { href: string; label: string };

export function DashboardNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="no-print mb-6 flex flex-wrap gap-2">
      {items.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== items[0]?.href && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              active
                ? "bg-brand-600 text-white"
                : "border border-[var(--border)] bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
