import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { AuthSystemInfo } from "@/components/auth/auth-system-info";
import { LoginForm } from "@/components/auth/login-form";
import { dashboardPath, resolveSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await resolveSession();
  if (session) redirect(dashboardPath(session.role));

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="text-xl font-semibold text-slate-900">Teclians</span>
        </Link>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-xl font-semibold text-slate-900">Sign in to your account</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Royal University of Bhutan colleges and Bhutan school-level institutions
          </p>
          <p className="mt-0.5 text-xs text-[var(--muted)]">
            CST, all RUB constituent colleges, and schools such as Motithang HSS.
          </p>
          <div className="mt-6">
            <LoginForm />
          </div>
        </div>
        <AuthSystemInfo />
      </div>
    </div>
  );
}
