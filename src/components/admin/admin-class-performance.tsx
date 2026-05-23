"use client";

import { useMemo, useState } from "react";
import type {
  CohortAtRiskStudent,
  CohortFilter,
  CohortStudentSummary,
  ModulePerformance,
} from "@/lib/admin-class-performance";

export function AdminClassPerformance({
  cohorts,
  dataByCohort,
}: {
  cohorts: CohortFilter[];
  dataByCohort: Record<
    string,
    {
      modules: ModulePerformance[];
      atRisk: CohortAtRiskStudent[];
      allStudents: CohortStudentSummary[];
    }
  >;
}) {
  const [department, setDepartment] = useState(cohorts[0]?.department ?? "");
  const [yearOfStudy, setYearOfStudy] = useState(cohorts[0]?.yearOfStudy ?? "");

  const departments = useMemo(
    () => [...new Set(cohorts.map((c) => c.department))].sort(),
    [cohorts],
  );

  const yearsForDept = useMemo(
    () =>
      cohorts
        .filter((c) => c.department === department)
        .map((c) => c.yearOfStudy)
        .sort(),
    [cohorts, department],
  );

  const cohortKey = `${department}::${yearOfStudy}`;
  const data = dataByCohort[cohortKey];
  const modules = data?.modules ?? [];
  const atRisk = data?.atRisk ?? [];
  const allStudents = data?.allStudents ?? [];

  if (cohorts.length === 0) {
    return (
      <p className="text-sm text-[var(--muted)]">
        No students with department and year information yet. Add department and year when
        creating student records.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="cohort-dept" className="mb-1.5 block text-sm font-medium text-slate-700">
            Department / programme
          </label>
          <select
            id="cohort-dept"
            value={department}
            onChange={(e) => {
              setDepartment(e.target.value);
              const nextYears = cohorts
                .filter((c) => c.department === e.target.value)
                .map((c) => c.yearOfStudy);
              setYearOfStudy(nextYears[0] ?? "");
            }}
            className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm"
          >
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="cohort-year" className="mb-1.5 block text-sm font-medium text-slate-700">
            Year of study
          </label>
          <select
            id="cohort-year"
            value={yearOfStudy}
            onChange={(e) => setYearOfStudy(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm"
          >
            {yearsForDept.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-900">
          Module averages — {department} · {yearOfStudy}
        </h3>
        {modules.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No enrolled classes for this cohort.</p>
        ) : (
          <ul className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-white">
            {modules.map((m) => (
              <li
                key={m.classId}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-slate-900">{m.subject}</p>
                  <p className="text-xs text-[var(--muted)]">{m.className}</p>
                </div>
                <div className="text-right">
                  <p>
                    <span className="text-[var(--muted)]">Class avg: </span>
                    <strong>{m.averageGrade}%</strong>
                  </p>
                  <p className="text-xs text-[var(--muted)]">
                    {m.attendanceRate}% attendance · {m.studentCount} students
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-slate-900">
          All students — {department} · {yearOfStudy}
        </h3>
        <p className="mb-3 text-xs text-[var(--muted)]">
          Full cohort roster with attendance and average grade across enrolled modules.
        </p>
        {allStudents.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No students in this cohort.</p>
        ) : (
          <ul className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-white">
            {allStudents.map((s) => (
              <li
                key={s.id}
                className={`flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm ${s.atRisk ? "bg-amber-50/60" : ""}`}
              >
                <div>
                  <p className="font-medium text-slate-900">{s.name}</p>
                  <p className="font-mono text-xs text-[var(--muted)]">ID: {s.studentNumber}</p>
                </div>
                <div className="text-right text-xs sm:text-sm">
                  <p>
                    <span className="text-[var(--muted)]">Attendance: </span>
                    <strong className={s.atRisk ? "text-amber-800" : ""}>{s.attendanceRate}%</strong>
                  </p>
                  <p className="text-[var(--muted)]">Avg grade: {s.averageGrade}%</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-slate-900">
          High-risk students (attendance below 90%)
        </h3>
        <p className="mb-3 text-xs text-[var(--muted)]">
          Students in this department and year whose overall attendance across their modules is
          under 90%.
        </p>
        {atRisk.length === 0 ? (
          <p className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-800">
            No students below 90% attendance in this cohort.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--border)] rounded-xl border border-amber-200 bg-amber-50/50">
            {atRisk.map((s) => (
              <li
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-slate-900">{s.name}</p>
                  <p className="font-mono text-xs text-[var(--muted)]">ID: {s.studentNumber}</p>
                </div>
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
                  {s.attendanceRate}% attendance
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
