import { DashboardShell } from "@/components/layout/dashboard-shell";
import { DataPanel } from "@/components/ui/data-panel";
import { requireSession } from "@/lib/auth";
import { getInstitutionBranding } from "@/lib/institution";
import { studentNav } from "@/lib/nav";
import { prisma } from "@/lib/prisma";

export default async function StudentAttendancePage() {
  const user = await requireSession(["STUDENT"]);
  const [records, institution] = await Promise.all([
    prisma.attendanceRecord.findMany({
      where: { studentId: user.id },
      include: { class: { select: { name: true, subject: true } } },
      orderBy: { date: "desc" },
    }),
    getInstitutionBranding(user.schoolId),
  ]);

  return (
    <DashboardShell
      user={user}
      title="Attendance records"
      subtitle="Your attendance history by class."
      nav={studentNav}
      institution={institution}
    >
      <DataPanel title="Attendance records">
        {records.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No attendance records yet.</p>
        ) : (
          <ul className="max-h-[32rem] divide-y divide-[var(--border)] overflow-y-auto">
            {records.map((record) => (
              <li
                key={record.id}
                className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm"
              >
                <div>
                  <p className="font-medium text-slate-900">{record.class.name}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {record.class.subject} · {record.date.toLocaleDateString()}
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium">
                  {record.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </DataPanel>
    </DashboardShell>
  );
}
