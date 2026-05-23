import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export type RoleFunction = {
  icon: LucideIcon;
  title: string;
  description: string;
  href?: string;
};

export function RoleFunctionsPanel({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle: string;
  items: RoleFunction[];
}) {
  return (
    <section className="mb-8 rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">{subtitle}</p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((fn) => {
          const Icon = fn.icon;
          const inner = (
            <>
              <Icon className="mb-2 h-5 w-5 text-brand-600" />
              <p className="font-medium text-slate-900">{fn.title}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">{fn.description}</p>
            </>
          );

          return (
            <li key={fn.title}>
              {fn.href ? (
                <Link
                  href={fn.href}
                  className="block h-full rounded-xl border border-[var(--border)] bg-slate-50 p-4 transition hover:border-brand-200 hover:bg-brand-50/50"
                >
                  {inner}
                </Link>
              ) : (
                <div className="block h-full rounded-xl border border-[var(--border)] bg-slate-50 p-4">
                  {inner}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
