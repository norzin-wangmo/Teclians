"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Trash2 } from "lucide-react";
import { buildStudentEmail } from "@/lib/account-naming";
import type { StudentRecord } from "@/lib/students";

type ClassOption = { id: string; name: string };

export function StudentManager({
  classes,
  students,
  schoolEmailDomain,
  institutionLevel = "COLLEGE",
  canDelete = true,
  allowCreate = true,
  allowEditStudentId = true,
}: {
  classes: ClassOption[];
  students: StudentRecord[];
  schoolEmailDomain: string;
  institutionLevel?: "COLLEGE" | "SCHOOL";
  canDelete?: boolean;
  allowCreate?: boolean;
  allowEditStudentId?: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [studentNumber, setStudentNumber] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [department, setDepartment] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [password, setPassword] = useState("");
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const previewEmail =
    studentNumber.trim() && allowCreate && !editingId
      ? buildStudentEmail(studentNumber, { emailDomain: schoolEmailDomain, institutionLevel })
      : "";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.studentNumber.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.department?.toLowerCase().includes(q) ?? false) ||
        (s.yearOfStudy?.toLowerCase().includes(q) ?? false) ||
        s.classNames.some((c) => c.toLowerCase().includes(q)),
    );
  }, [students, query]);

  function resetForm() {
    setEditingId(null);
    setStudentNumber("");
    setDisplayName("");
    setDepartment("");
    setYearOfStudy("");
    setPassword("");
    setSelectedClasses([]);
  }

  function startEdit(student: StudentRecord) {
    setEditingId(student.id);
    setStudentNumber(student.studentNumber);
    setDisplayName(student.name);
    setDepartment(student.department ?? "");
    setYearOfStudy(student.yearOfStudy ?? "");
    setPassword("");
    setSelectedClasses(student.classIds);
    setMessage("");
  }

  function toggleClass(classId: string) {
    setSelectedClasses((prev) =>
      prev.includes(classId) ? prev.filter((id) => id !== classId) : [...prev, classId],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const payload = {
      studentNumber,
      displayName: displayName.trim() || undefined,
      department: department.trim() || undefined,
      yearOfStudy: yearOfStudy.trim() || undefined,
      classIds: selectedClasses,
      ...(password ? { password } : {}),
    };

    const res = await fetch(editingId ? `/api/students/${editingId}` : "/api/students", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage(data.error ?? "Request failed");
      return;
    }

    setMessage(editingId ? "Student updated." : "Student added.");
    resetForm();
    router.refresh();
  }

  async function handleDelete(student: StudentRecord) {
    const confirmed = window.confirm(
      `Delete student ${student.studentNumber}? This removes their attendance, grades, and enrollments permanently.`,
    );
    if (!confirmed) return;

    setDeletingId(student.id);
    setMessage("");

    const res = await fetch(`/api/students/${student.id}`, { method: "DELETE" });
    const data = await res.json();
    setDeletingId(null);

    if (!res.ok) {
      setMessage(data.error ?? "Delete failed");
      return;
    }

    if (editingId === student.id) resetForm();
    setMessage("Student record deleted.");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {allowCreate || editingId ? (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-[var(--border)] bg-slate-50 p-4"
        >
          <h3 className="text-sm font-semibold text-slate-900">
            {editingId ? "Edit student" : "Add student record"}
          </h3>
          <p className="mt-1 text-xs text-[var(--muted)]">
            <strong>Student ID</strong> is used for login. Full name is for display only.
            {institutionLevel === "SCHOOL"
              ? " School-level emails use @education.gov.bt (e.g. 201.00310.11.0036@education.gov.bt)."
              : " College emails are generated from the ID under @rub.edu.bt."}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Student ID (login)
              </label>
              <input
                value={studentNumber}
                onChange={(e) => setStudentNumber(e.target.value)}
                disabled={!!editingId && !allowEditStudentId}
                placeholder={
                  institutionLevel === "SCHOOL" ? "e.g. 201.00310.11.0036" : "e.g. 02250359.cst"
                }
                className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm disabled:bg-slate-100"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Full name</label>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Norzin Wangmo"
              className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
            />
          </div>
          {institutionLevel === "COLLEGE" && allowCreate ? (
            <>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Department / programme
                </label>
                <input
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Software Engineering"
                  className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">Year of study</label>
                <input
                  value={yearOfStudy}
                  onChange={(e) => setYearOfStudy(e.target.value)}
                  placeholder="e.g. Year 1"
                  className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
                />
              </div>
            </>
          ) : null}
            {previewEmail || (editingId && !allowEditStudentId) ? (
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Education email
                </label>
                <p className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--muted)]">
                  {editingId
                    ? students.find((s) => s.id === editingId)?.email
                    : previewEmail}
                </p>
              </div>
            ) : null}
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Password {editingId ? "(leave blank to keep)" : "(default: password123)"}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
                placeholder={editingId ? "Optional" : "password123"}
              />
            </div>
          </div>
          {classes.length > 0 ? (
            <fieldset className="mt-3">
              <legend className="text-xs font-medium text-slate-700">Enroll in classes</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {classes.map((cls) => (
                  <label
                    key={cls.id}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-xs"
                  >
                    <input
                      type="checkbox"
                      checked={selectedClasses.includes(cls.id)}
                      onChange={() => toggleClass(cls.id)}
                    />
                    {cls.name}
                  </label>
                ))}
              </div>
            </fieldset>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Saving…" : editingId ? "Save changes" : "Add student"}
            </button>
            {editingId ? (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium"
              >
                Cancel
              </button>
            ) : null}
          </div>
          {message ? (
            <p
              className={`mt-2 text-sm ${message.includes("deleted") || message.includes("updated") || message.includes("added") ? "text-teal-700" : "text-red-600"}`}
            >
              {message}
            </p>
          ) : null}
        </form>
      ) : null}

      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-slate-900">
            Student records ({filtered.length}
            {query ? ` of ${students.length}` : ""})
          </h3>
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search student ID, email, or class…"
              className="w-full rounded-lg border border-[var(--border)] bg-white py-2 pl-9 pr-3 text-sm outline-none ring-blue-500 focus:ring-2"
            />
          </div>
        </div>

        {students.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No student records yet.</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No students match your search.</p>
        ) : (
          <ul className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-white">
            {filtered.map((student) => (
              <li
                key={student.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">{student.name}</p>
                  {student.department || student.yearOfStudy ? (
                    <p className="text-xs text-slate-700">
                      {[student.department, student.yearOfStudy].filter(Boolean).join(" · ")}
                    </p>
                  ) : null}
                  <p className="font-mono text-xs text-slate-700">ID: {student.studentNumber}</p>
                  <p className="text-xs text-[var(--muted)]">{student.email}</p>
                  {student.classNames.length > 0 ? (
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {student.classNames.join(" · ")}
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-amber-700">Not enrolled in a class</p>
                  )}
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(student)}
                    className="rounded-lg border border-[var(--border)] px-3 py-1 text-xs font-medium hover:bg-slate-50"
                  >
                    Edit
                  </button>
                  {canDelete ? (
                    <button
                      type="button"
                      onClick={() => handleDelete(student)}
                      disabled={deletingId === student.id}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-60"
                    >
                      <Trash2 className="h-3 w-3" />
                      {deletingId === student.id ? "…" : "Delete"}
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
