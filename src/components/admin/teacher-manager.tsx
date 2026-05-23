"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PasswordInput } from "@/components/ui/password-input";
import {
  emailLocalPart,
  formatStaffNameFromEmail,
} from "@/lib/account-naming";
import { EDUCATION_EMAIL_HINT } from "@/lib/email-policy";
import { teachingStaffLabel } from "@/lib/copy";
import { STAFF_ROLE_LABELS } from "@/lib/roles";
import { parseModulesTaught } from "@/lib/teaching-modules";
import type { InstitutionLevel } from "@prisma/client";

type StaffRow = {
  id: string;
  name: string;
  email: string;
  role: "TEACHER" | "LECTURER";
  modulesTaught: string | null;
};

export function TeacherManager({
  teachers,
  moduleOptions,
  institutionLevel = "COLLEGE",
}: {
  teachers: StaffRow[];
  moduleOptions: string[];
  institutionLevel?: InstitutionLevel;
}) {
  const isCollege = institutionLevel === "COLLEGE";
  const staffLabel = teachingStaffLabel(institutionLevel);
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"TEACHER" | "LECTURER">(isCollege ? "LECTURER" : "TEACHER");
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [customModule, setCustomModule] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function resetForm() {
    setEditingId(null);
    setName("");
    setEmail("");
    setPassword("");
    setRole(isCollege ? "LECTURER" : "TEACHER");
    setSelectedModules([]);
    setCustomModule("");
  }

  function startEdit(staff: StaffRow) {
    setEditingId(staff.id);
    setName(staff.name);
    setEmail(staff.email);
    setRole(staff.role);
    setSelectedModules(parseModulesTaught(staff.modulesTaught));
    setPassword("");
    setMessage("");
  }

  function toggleModule(module: string) {
    setSelectedModules((prev) =>
      prev.includes(module) ? prev.filter((m) => m !== module) : [...prev, module],
    );
  }

  function addCustomModule() {
    const trimmed = customModule.trim();
    if (!trimmed || selectedModules.includes(trimmed)) return;
    setSelectedModules((prev) => [...prev, trimmed]);
    setCustomModule("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedModules.length === 0) {
      setMessage(`Select at least one module the ${staffLabel.toLowerCase()} will teach.`);
      return;
    }

    setLoading(true);
    setMessage("");

    const payload = {
      name,
      email,
      role,
      modules: selectedModules,
      ...(password ? { password } : {}),
    };
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
      <p className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-900">
        Only <strong>{staffLabel.toLowerCase()}</strong> accounts can be created here
        {isCollege ? " (college)" : " (high school)"}.
        Specify which <strong>modules</strong> they teach — a class is created for each module if
        needed. The display name must <strong>start with the education email account</strong>.{" "}
        {EDUCATION_EMAIL_HINT}
      </p>

      <form onSubmit={handleSubmit} className="rounded-xl border border-[var(--border)] bg-slate-50 p-4">
        <h3 className="text-sm font-semibold text-slate-900">
          {editingId
            ? `Edit ${staffLabel.toLowerCase()} account`
            : `Create ${staffLabel.toLowerCase()} account`}
        </h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "TEACHER" | "LECTURER")}
              className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
            >
              {!isCollege ? (
                <option value="TEACHER">{STAFF_ROLE_LABELS.TEACHER}</option>
              ) : (
                <option value="LECTURER">{STAFF_ROLE_LABELS.LECTURER}</option>
              )}
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
            <PasswordInput
              value={password}
              onChange={setPassword}
              className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm outline-none ring-brand-600 focus:ring-2"
            />
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className="text-xs font-medium text-slate-700">Modules taught *</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {moduleOptions.map((module) => (
              <label
                key={module}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-xs"
              >
                <input
                  type="checkbox"
                  checked={selectedModules.includes(module)}
                  onChange={() => toggleModule(module)}
                />
                {module}
              </label>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <input
              value={customModule}
              onChange={(e) => setCustomModule(e.target.value)}
              placeholder="Add another module…"
              className="min-w-[180px] flex-1 rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={addCustomModule}
              className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm font-medium"
            >
              Add module
            </button>
          </div>
        </fieldset>

        <div className="mt-4 flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
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
            className={`mt-2 text-sm ${message.includes("created") || message.includes("updated") ? "text-brand-700" : "text-red-600"}`}
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
              {staff.modulesTaught ? (
                <p className="mt-1 text-xs text-slate-700">Modules: {staff.modulesTaught}</p>
              ) : null}
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
