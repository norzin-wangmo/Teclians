import Link from "next/link";
import { BrandLogo } from "@/components/layout/brand-logo";
import { SignupForm } from "@/components/auth/signup-form";
import { dashboardPath, resolveSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SignupPage() {
  const session = await resolveSession();
  if (session) redirect(dashboardPath(session.role));

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <BrandLogo href="/" size="md" className="mb-8 w-full justify-center" />
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-xl font-semibold text-slate-900">Student sign up</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Create your Edu Track account with your official student ID.
          </p>
          <div className="mt-6">
            <SignupForm />
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-[var(--muted)]">
          <Link href="/" className="text-brand-700 hover:underline">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
