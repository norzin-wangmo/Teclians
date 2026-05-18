"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  emailLocalPart,
  formatStaffNameFromEmail,
} from "@/lib/account-naming";
import { EDUCATION_EMAIL_HINT } from "@/lib/email-policy";
import { STAFF_ROLE_LABELS } from "@/lib/roles";

type StaffRow = { id: string; name: string; email: string; role: "TEACHER" | "LECTURER" };

export function TeacherManager({ teachers }: { teachers: StaffRow[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"TEACHER" | "LECTURER">("TEACHER");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function resetForm() {
    setEditingId(null);
    setName("");
    setEmail("");
    setPassword("");
    setRole("TEACHER");
  }

  function startEdit(staff: StaffRow) {
    setEditingId(staff.id);
    setName(staff.name);
    setEmail(staff.email);
    setRole(staff.role);
    setPassword("");
    setMessage("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const payload = { name, email, role, ...(password ? { password } : {}) };
    const res = await fetch(
      editingId ? `/api/admin/teachers/${editingId}` : "/api/admin/teachers",
      {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage(data.error ?? "Request failed");
      return;
    }

    setMessage(
      editingId
        ? "Account updated."
        : `${STAFF_ROLE_LABELS[role]} account created (education email only).`,
    );
    resetForm();
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <p className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
        Only <strong>Teacher</strong> and <strong>Lecturer</strong> accounts can be created here.
        The display name must <strong>start with the education email account</strong> (the part
        before @). {EDUCATION_EMAIL_HINT}
      </p>

      <form onSubmit={handleSubmit} className="rounded-xl border border-[var(--border)] bg-slate-50 p-4">
        <h3 className="text-sm font-semibold text-slate-900">
          {editingId ? "Edit staff account" : "Create teacher or lecturer account"}
        </h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "TEACHER" | "LECTURER")}
              className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
            >
              <option value="TEACHER">{STAFF_ROLE_LABELS.TEACHER}</option>
              <option value="LECTURER">{STAFF_ROLE_LABELS.LECTURER}</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Institutional email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                const next = e.target.value;
                setEmail(next);
                if (!editingId || !name || name === formatStaffNameFromEmail(email)) {
                  setName(formatStaffNameFromEmail(next));
                }
              }}
              placeholder="james.okonkwo@school.edu"
              className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Display name (starts with {email ? emailLocalPart(email) : "email account"})
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={email ? formatStaffNameFromEmail(email) : ""}
              className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Password {editingId ? "(optional)" : "(default: password123)"}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Saving…" : editingId ? "Save changes" : "Create account"}
          </button>
          {editingId ? (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm"
            >
              Cancel
            </button>
          ) : null}
        </div>
        {message ? (
          <p
            className={`mt-2 text-sm ${message.includes("created") || message.includes("updated") ? "text-teal-700" : "text-red-600"}`}
          >
            {message}
          </p>
        ) : null}
      </form>

      <ul className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-white">
        {teachers.map((staff) => (
          <li
            key={staff.id}
            className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
          >
            <div>
              <p className="font-medium text-slate-900">
                {staff.name}{" "}
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-normal text-slate-600">
                  {STAFF_ROLE_LABELS[staff.role]}
                </span>
              </p>
              <p className="text-[var(--muted)]">{staff.email}</p>
            </div>
            <button
              type="button"
              onClick={() => startEdit(staff)}
              className="rounded-lg border border-[var(--border)] px-3 py-1 text-xs font-medium"
            >
              Edit
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
