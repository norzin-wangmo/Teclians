import Link from "next/link";
import { GraduationCap, LogOut } from "lucide-react";
import { InstitutionBadge } from "@/components/layout/institution-badge";
import type { InstitutionBranding } from "@/lib/institution";
import type { SessionUser } from "@/lib/types";
import { dashboardPath } from "@/lib/auth";
import { DashboardNav, type NavItem } from "@/components/layout/dashboard-nav";

const roleLabels: Record<SessionUser["role"], string> = {
  TEACHER: "Teacher",
  LECTURER: "Lecturer",
  STUDENT: "Student",
  ADMIN: "School Administrator",
  AUTHORITY: "Education Ministry Official",
};

export function DashboardShell({
  user,
  title,
  subtitle,
  nav,
  institution,
  children,
}: {
  user: SessionUser;
  title: string;
  subtitle?: string;
  nav?: NavItem[];
  institution?: InstitutionBranding | null;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--border)] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href={dashboardPath(user.role)} className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
              <GraduationCap className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">Teclians</p>
              <p className="text-xs text-[var(--muted)]">{roleLabels[user.role]}</p>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            {institution &&
            (user.role === "TEACHER" ||
              user.role === "LECTURER" ||
              user.role === "STUDENT") ? (
              <InstitutionBadge institution={institution} />
            ) : null}
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-900">{user.name}</p>
              <p className="text-xs text-[var(--muted)]">{user.email}</p>
            </div>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-2 max-w-3xl text-sm text-[var(--muted)] sm:text-base">{subtitle}</p>
          ) : null}
        </div>
        {nav && nav.length > 0 ? <DashboardNav items={nav} /> : null}
        {children}
      </main>
    </div>
  );
}
