"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EDUCATION_EMAIL_HINT } from "@/lib/email-policy";

const demoAccounts = [
  { role: "Teacher (CST)", login: "Karmagayley.cst@rub.edu.bt", hint: "education email" },
  { role: "Student (CST)", login: "02250359.cst", hint: "student ID" },
  {
    role: "Student (Motithang HSS)",
    login: "201.00310.11.0036",
    hint: "student ID",
  },
  { role: "School Administrator", login: "admin@rub.edu.bt", hint: "education email" },
  { role: "Ministry Official", login: "authority@education.gov", hint: "education email" },
];

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("Karmagayley.cst@rub.edu.bt");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Login failed");
      return;
    }

    router.push(data.redirect);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
          Education email or student ID
        </label>
        <input
          id="email"
          type="text"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="staff@rub.edu.bt or 201.00310.11.0036"
          className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm outline-none ring-blue-500 focus:ring-2"
          required
        />
        <p className="mt-1 text-xs text-[var(--muted)]">
          <strong>Staff</strong> use education email. <strong>Students</strong> use student ID only
          (college: e.g. <code className="rounded bg-slate-100 px-1">02250359.cst</code>, school:{" "}
          <code className="rounded bg-slate-100 px-1">201.00310.11.0036</code>).
        </p>
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm outline-none ring-blue-500 focus:ring-2"
          required
        />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>

      <div className="rounded-xl border border-dashed border-[var(--border)] bg-slate-50 p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          Demo accounts
        </p>
        <ul className="space-y-1.5">
          {demoAccounts.map((account) => (
            <li key={account.login}>
              <button
                type="button"
                onClick={() => {
                  setEmail(account.login);
                  setPassword("password123");
                }}
                className="text-left text-sm text-blue-700 hover:underline"
              >
                {account.role} ({account.hint}): {account.login}
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-[var(--muted)]">
          CST: Norzin Wangmo · Motithang HSS: Tashi phuntsho · Teacher: Karma Gayley · Password:
          password123
        </p>
        <p className="mt-2 text-xs text-[var(--muted)]">{EDUCATION_EMAIL_HINT}</p>
      </div>
    </form>
  );
}
