"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Student = { id: string; name: string };
type ClassOption = { id: string; name: string; students: Student[] };

export function RecordAttendanceForm({ classes }: { classes: ClassOption[] }) {
  const router = useRouter();
  const [classId, setClassId] = useState(classes[0]?.id ?? "");
  const [studentId, setStudentId] = useState(classes[0]?.students[0]?.id ?? "");
  const [status, setStatus] = useState("PRESENT");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedClass = classes.find((c) => c.id === classId);
  const students = selectedClass?.students ?? [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId, studentId, status, date }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage(data.error ?? "Failed to record attendance");
      return;
    }

    setMessage("Attendance recorded successfully.");
    router.refresh();
  }

  if (classes.length === 0) {
    return (
      <p className="text-sm text-[var(--muted)]">No classes assigned to record attendance.</p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Class</label>
        <select
          value={classId}
          onChange={(e) => {
            setClassId(e.target.value);
            const next = classes.find((c) => c.id === e.target.value);
            setStudentId(next?.students[0]?.id ?? "");
          }}
          className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm"
        >
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Student</label>
        <select
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm"
        >
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm"
          required
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm"
        >
          <option value="PRESENT">Present</option>
          <option value="ABSENT">Absent</option>
          <option value="LATE">Late</option>
          <option value="EXCUSED">Excused</option>
        </select>
      </div>
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Saving…" : "Record attendance"}
        </button>
        {message ? <p className="mt-2 text-sm text-teal-700">{message}</p> : null}
      </div>
    </form>
  );
}
