import { AlertTriangle } from "lucide-react";
import type { AtRiskStudent } from "@/lib/at-risk";

export function AtRiskStudents({ students }: { students: AtRiskStudent[] }) {
  if (students.length === 0) {
    return (
      <p className="text-sm text-[var(--muted)]">
        No students currently flagged. Thresholds: attendance below 80% or average grade below 65%
        in your classes.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {students.map((student) => (
        <li
          key={student.id}
          className="rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3 text-sm"
        >
          <div className="flex gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div>
              <p className="font-medium text-slate-900">{student.name}</p>
              <p className="text-xs text-[var(--muted)]">{student.email}</p>
              <ul className="mt-1 list-inside list-disc text-xs text-amber-900">
                {student.reasons.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
