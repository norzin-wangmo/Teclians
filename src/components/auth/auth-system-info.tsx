import { KeyRound, LogIn, LogOut, Lock, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: LogIn,
    title: "User login",
    description: "Sign in with email and password to access your role-specific dashboard.",
  },
  {
    icon: LogOut,
    title: "User logout",
    description: "Secure sign-out clears your session cookie immediately.",
  },
  {
    icon: Lock,
    title: "Secure authentication",
    description: "Passwords are hashed with bcrypt; sessions use signed HTTP-only JWT cookies.",
  },
  {
    icon: ShieldCheck,
    title: "Role-based access permissions",
    description:
      "Teachers, students, administrators, and ministry officials each see only what their role allows.",
  },
  {
    icon: KeyRound,
    title: "Protected routes",
    description: "Middleware and API checks enforce permissions on every dashboard and data request.",
  },
];

export function AuthSystemInfo() {
  return (
    <section className="mt-8 rounded-2xl border border-[var(--border)] bg-slate-50 p-5">
      <h2 className="text-sm font-semibold text-slate-900">Authentication system</h2>
      <p className="mt-1 text-xs text-[var(--muted)]">
        Section 7.1 — secure login with role-based access control
      </p>
      <ul className="mt-4 space-y-3">
        {features.map((f) => (
          <li key={f.title} className="flex gap-3 text-sm">
            <f.icon className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
            <div>
              <p className="font-medium text-slate-900">{f.title}</p>
              <p className="text-xs text-[var(--muted)]">{f.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
