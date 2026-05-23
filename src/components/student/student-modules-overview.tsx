import type { StudentClassSummary } from "@/lib/student-enrollment-summary";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function StudentModulesOverview({ modules }: { modules: StudentClassSummary[] }) {
  if (modules.length === 0) {
    return (
      <p className="text-sm text-[var(--muted)]">
        You are not enrolled in any classes yet. Contact your school administrator.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {modules.map((mod) => {
        return (
          <li
            key={mod.classId}
            className="rounded-xl border border-[var(--border)] bg-white p-4 sm:p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--border)] pb-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">{mod.subject}</p>
                <p className="mt-0.5 text-xs text-[var(--muted)]">{mod.className}</p>
              </div>
              <div className="text-right text-sm">
                <p className="font-semibold text-slate-900">
                  {mod.averageGrade !== null ? `${mod.averageGrade}%` : "—"}
                </p>
                <p className="text-xs text-[var(--muted)]">
                  Module avg
                  {mod.assessmentCount > 0
                    ? ` · ${mod.assessmentCount} assessment${mod.assessmentCount === 1 ? "" : "s"}`
                    : ""}
                </p>
              </div>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-slate-50 px-3 py-2.5 text-sm">
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                  Attendance
                </p>
                <p className="mt-1 font-semibold text-slate-900">
                  {mod.attendedSessions} of {mod.totalSessions} sessions attended
                </p>
                <p className="mt-0.5 text-xs text-[var(--muted)]">
                  {mod.totalSessions === 0
                    ? "No sessions recorded yet"
                    : `${mod.attendanceRate}% attendance rate`}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-2.5 text-sm">
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                  Classes missed
                </p>
                {mod.missedSessions.length === 0 ? (
                  <p className="mt-1 text-brand-800">No missed classes recorded</p>
                ) : (
                  <p className="mt-1 font-semibold text-slate-900">
                    {mod.missedSessions.length} missed session
                    {mod.missedSessions.length === 1 ? "" : "s"}
                    {mod.lateSessions > 0
                      ? ` · ${mod.lateSessions} late (counted as attended)`
                      : ""}
                  </p>
                )}
              </div>
            </div>

            {mod.missedSessions.length > 0 ? (
              <div className="mt-3">
                <p className="mb-2 text-xs font-medium text-slate-700">Missed class dates</p>
                <ul className="divide-y divide-[var(--border)] rounded-lg border border-[var(--border)]">
                  {mod.missedSessions.map((session) => (
                    <li
                      key={`${mod.classId}-${session.date}`}
                      className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm"
                    >
                      <span className="text-slate-800">{formatDate(session.date)}</span>
                      <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-800">
                        Absent
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
