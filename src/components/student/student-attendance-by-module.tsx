"use client";

import { useMemo, useState } from "react";
import type { AttendanceStatus } from "@prisma/client";
import type { StudentModuleAttendance } from "@/lib/student-enrollment-summary";

function formatSessionDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function statusStyles(status: AttendanceStatus) {
  switch (status) {
    case "PRESENT":
      return "bg-brand-50 text-brand-800";
    case "ABSENT":
      return "bg-red-50 text-red-800";
    case "LATE":
      return "bg-amber-50 text-amber-900";
    case "EXCUSED":
      return "bg-brand-50 text-brand-800";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function statusLabel(status: AttendanceStatus) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export function StudentAttendanceByModule({
  modules,
}: {
  modules: StudentModuleAttendance[];
}) {
  const [moduleFilter, setModuleFilter] = useState<string>("all");

  const visibleModules = useMemo(() => {
    if (moduleFilter === "all") return modules;
    return modules.filter((m) => m.classId === moduleFilter);
  }, [modules, moduleFilter]);

  if (modules.length === 0) {
    return (
      <p className="text-sm text-[var(--muted)]">
        You are not enrolled in any modules yet. Attendance will appear here once your lecturer
        records sessions.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="attendance-module"
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          Module
        </label>
        <select
          id="attendance-module"
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className="w-full max-w-lg rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm font-medium"
        >
          <option value="all">All modules</option>
          {modules.map((mod) => (
            <option key={mod.classId} value={mod.classId}>
              {mod.subject}
            </option>
          ))}
        </select>
      </div>

      {visibleModules.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">No attendance for this module.</p>
      ) : (
        <ul className="space-y-4">
          {visibleModules.map((mod) => (
            <li
              key={mod.classId}
              className="rounded-xl border border-[var(--border)] bg-white p-4 sm:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--border)] pb-3">
                <div>
                  <p className="font-semibold text-slate-900">{mod.subject}</p>
                  <p className="mt-0.5 text-xs text-[var(--muted)]">{mod.className}</p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-semibold text-slate-900">
                    {mod.attendedSessions} of {mod.totalSessions} sessions
                  </p>
                  <p className="text-xs text-[var(--muted)]">
                    {mod.totalSessions === 0
                      ? "No sessions recorded"
                      : `${mod.attendanceRate}% attendance`}
                  </p>
                </div>
              </div>

              {mod.sessions.length === 0 ? (
                <p className="mt-3 text-sm text-[var(--muted)]">
                  No attendance recorded for this module yet.
                </p>
              ) : (
                <ul className="mt-3 divide-y divide-[var(--border)] rounded-lg border border-[var(--border)]">
                  {mod.sessions.map((session) => (
                    <li
                      key={session.id}
                      className="flex flex-wrap items-center justify-between gap-3 px-3 py-3 text-sm sm:px-4"
                    >
                      <div>
                        <p className="font-medium text-slate-900">
                          {formatSessionDate(session.date)}
                        </p>
                        <p className="mt-0.5 text-xs text-[var(--muted)]">Class session</p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles(session.status)}`}
                      >
                        {statusLabel(session.status)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
