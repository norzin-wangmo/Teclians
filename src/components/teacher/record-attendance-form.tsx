"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";

import type { TeacherClassOption, TeacherStudent } from "@/components/teacher/teacher-class-types";

function isPresent(status: AttendanceStatus) {
  return status === "PRESENT" || status === "LATE" || status === "EXCUSED";
}

export function RecordAttendanceForm({ classes }: { classes: TeacherClassOption[] }) {
  const router = useRouter();
  const [classId, setClassId] = useState(classes[0]?.id ?? "");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedClass = classes.find((c) => c.id === classId);
  const students = selectedClass?.students ?? [];

  const initAllPresent = useCallback((list: TeacherStudent[]) => {
    const next: Record<string, AttendanceStatus> = {};
    for (const s of list) next[s.id] = "PRESENT";
    setStatuses(next);
  }, []);

  const loadAttendance = useCallback(
    async (targetClassId: string, targetDate: string, list: TeacherStudent[]) => {
      if (!targetClassId || list.length === 0) {
        setStatuses({});
        return;
      }

      setLoadingRecords(true);
      try {
        const res = await fetch(
          `/api/attendance?classId=${encodeURIComponent(targetClassId)}&date=${encodeURIComponent(targetDate)}`,
        );
        const data = await res.json();
        if (!res.ok) {
          initAllPresent(list);
          return;
        }

        const byStudent = new Map<string, AttendanceStatus>(
          (data.records as { studentId: string; status: AttendanceStatus }[]).map((r) => [
            r.studentId,
            r.status,
          ]),
        );

        const next: Record<string, AttendanceStatus> = {};
        for (const s of list) {
          next[s.id] = byStudent.get(s.id) ?? "PRESENT";
        }
        setStatuses(next);
      } finally {
        setLoadingRecords(false);
      }
    },
    [initAllPresent],
  );

  const studentKey = students.map((s) => s.id).join(",");

  useEffect(() => {
    if (!classId || students.length === 0) {
      setStatuses({});
      return;
    }
    void loadAttendance(classId, date, students);
  }, [classId, date, studentKey, loadAttendance]);

  function setPresent(studentId: string, present: boolean) {
    setStatuses((prev) => ({
      ...prev,
      [studentId]: present ? "PRESENT" : "ABSENT",
    }));
  }

  function setStatus(studentId: string, status: AttendanceStatus) {
    setStatuses((prev) => ({ ...prev, [studentId]: status }));
  }

  function markAllPresent() {
    initAllPresent(students);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (students.length === 0) return;

    setLoading(true);
    setMessage("");

    const records = students.map((s) => ({
      studentId: s.id,
      status: statuses[s.id] ?? "ABSENT",
    }));

    const res = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId, date, records }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage(data.error ?? "Failed to save attendance");
      return;
    }

    setMessage(`Attendance saved for ${data.saved ?? records.length} students.`);
    router.refresh();
  }

  if (classes.length === 0) {
    return (
      <p className="text-sm text-[var(--muted)]">No classes assigned to record attendance.</p>
    );
  }

  const presentCount = students.filter((s) => isPresent(statuses[s.id] ?? "ABSENT")).length;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Class</label>
          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
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
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm"
            required
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-[var(--muted)]">
          {loadingRecords
            ? "Loading…"
            : `${presentCount} of ${students.length} marked present`}
        </p>
        <button
          type="button"
          onClick={markAllPresent}
          className="text-sm font-medium text-blue-700 hover:underline"
        >
          Mark all present
        </button>
      </div>

      {students.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">No students enrolled in this class.</p>
      ) : (
        <ul className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-white">
          {students.map((student) => {
            const status = statuses[student.id] ?? "PRESENT";
            const present = isPresent(status);
            return (
              <li
                key={student.id}
                className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm"
              >
                <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={present}
                    onChange={(e) => setPresent(student.id, e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="min-w-0">
                    <span className="font-medium text-slate-900">{student.name}</span>
                    {student.studentNumber ? (
                      <span className="ml-2 font-mono text-xs text-[var(--muted)]">
                        {student.studentNumber}
                      </span>
                    ) : null}
                  </span>
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(student.id, e.target.value as AttendanceStatus)}
                  className="rounded-lg border border-[var(--border)] bg-slate-50 px-2 py-1 text-xs"
                  aria-label={`Status for ${student.name}`}
                >
                  <option value="PRESENT">Present</option>
                  <option value="LATE">Late</option>
                  <option value="EXCUSED">Excused</option>
                  <option value="ABSENT">Absent</option>
                </select>
              </li>
            );
          })}
        </ul>
      )}

      <div>
        <button
          type="submit"
          disabled={loading || loadingRecords || students.length === 0}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Saving…" : "Save attendance"}
        </button>
        {message ? (
          <p
            className={`mt-2 text-sm ${message.includes("saved") ? "text-teal-700" : "text-red-600"}`}
          >
            {message}
          </p>
        ) : null}
        <p className="mt-2 text-xs text-[var(--muted)]">
          Tick the box for students who are present. Use the status dropdown for late or excused.
        </p>
      </div>
    </form>
  );
}
