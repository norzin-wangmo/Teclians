"use client";

import { useMemo, useState } from "react";
import type { ClassMarksSheet } from "@/lib/teacher-marks";

function formatPercent(score: number, maxScore: number) {
  if (maxScore <= 0) return "—";
  return `${Math.round((score / maxScore) * 100)}%`;
}

export function StudentMarksViewer({ sheets }: { sheets: ClassMarksSheet[] }) {
  const [classId, setClassId] = useState(sheets[0]?.classId ?? "");
  const [assessmentFilter, setAssessmentFilter] = useState<string>("all");

  const sheet = sheets.find((s) => s.classId === classId);

  const visibleAssessments = useMemo(() => {
    if (!sheet) return [];
    if (assessmentFilter === "all") return sheet.assessments;
    return sheet.assessments.filter((t) => t === assessmentFilter);
  }, [sheet, assessmentFilter]);

  if (sheets.length === 0) {
    return (
      <p className="text-sm text-[var(--muted)]">
        No classes assigned yet. Marks will appear here after you record quizzes, assignments,
        midterms, and other assessments.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="marks-class" className="mb-1.5 block text-sm font-medium text-slate-700">
            Class / module
          </label>
          <select
            id="marks-class"
            value={classId}
            onChange={(e) => {
              setClassId(e.target.value);
              setAssessmentFilter("all");
            }}
            className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm font-medium"
          >
            {sheets.map((s) => (
              <option key={s.classId} value={s.classId}>
                {s.className}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="marks-assessment"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Assessment
          </label>
          <select
            id="marks-assessment"
            value={assessmentFilter}
            onChange={(e) => setAssessmentFilter(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm"
            disabled={!sheet || sheet.assessments.length === 0}
          >
            <option value="all">All quizzes, assignments & exams</option>
            {sheet?.assessments.map((title) => (
              <option key={title} value={title}>
                {title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!sheet ? null : sheet.assessments.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[var(--border)] bg-slate-50 px-4 py-6 text-sm text-[var(--muted)]">
          No marks recorded for this class yet. Use <strong>Record data</strong> → Assignment &
          marks to enter scores.
        </p>
      ) : visibleAssessments.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">No marks match this filter.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-white">
          <table className="w-full min-w-max border-collapse text-sm">
            <colgroup>
              <col className="min-w-[11rem] w-[11rem]" />
              {visibleAssessments.map((title) => (
                <col key={title} className="min-w-[7.5rem] w-[7.5rem]" />
              ))}
            </colgroup>
            <thead>
              <tr className="bg-slate-50">
                <th
                  scope="col"
                  className="sticky left-0 z-20 border-b border-r border-[var(--border)] bg-slate-50 px-4 py-3 text-left align-middle text-xs font-semibold text-slate-700 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]"
                >
                  Student
                </th>
                {visibleAssessments.map((title) => (
                  <th
                    key={title}
                    scope="col"
                    className="border-b border-[var(--border)] px-3 py-3 text-center align-middle text-xs font-semibold leading-snug text-slate-700"
                  >
                    <span className="block px-1">{title}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sheet.students.length === 0 ? (
                <tr>
                  <td
                    colSpan={visibleAssessments.length + 1}
                    className="px-4 py-6 text-center text-[var(--muted)]"
                  >
                    No students enrolled in this class.
                  </td>
                </tr>
              ) : (
                sheet.students.map((student, rowIndex) => {
                  const isLast = rowIndex === sheet.students.length - 1;
                  return (
                    <tr key={student.id} className="group">
                      <td
                        className={`sticky left-0 z-10 border-r border-[var(--border)] bg-white px-4 py-3 align-middle shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)] group-hover:bg-slate-50 ${
                          isLast ? "border-b-0" : "border-b border-[var(--border)]"
                        }`}
                      >
                        <p className="font-medium leading-snug text-slate-900">{student.name}</p>
                        {student.studentNumber ? (
                          <p className="mt-0.5 font-mono text-xs leading-tight text-[var(--muted)]">
                            {student.studentNumber}
                          </p>
                        ) : null}
                      </td>
                      {visibleAssessments.map((title) => {
                        const cell = student.marks[title];
                        return (
                          <td
                            key={title}
                            className={`px-3 py-3 text-center align-middle ${
                              isLast ? "border-b-0" : "border-b border-[var(--border)]"
                            } group-hover:bg-slate-50`}
                          >
                            {cell ? (
                              <div className="inline-flex min-h-[2.5rem] flex-col items-center justify-center leading-tight">
                                <span className="font-semibold tabular-nums text-slate-900">
                                  {cell.score}/{cell.maxScore}
                                </span>
                                <span className="text-xs tabular-nums text-[var(--muted)]">
                                  {formatPercent(cell.score, cell.maxScore)}
                                </span>
                              </div>
                            ) : (
                              <span className="inline-flex min-h-[2.5rem] items-center justify-center text-[var(--muted)]">
                                —
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
