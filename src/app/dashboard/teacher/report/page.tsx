import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PrintReportButton } from "@/components/reports/print-report-button";
import { requireSession } from "@/lib/auth";
import { STAFF_TEACHING_ROLES } from "@/lib/roles";
import { getTeacherModuleAnalytics } from "@/lib/analytics";
import { prisma } from "@/lib/prisma";

import { lecturerNav } from "@/lib/nav";
import { formatInstitution } from "@/lib/school";

export default async function TeacherReportPage() {
  const user = await requireSession([...STAFF_TEACHING_ROLES]);
  const modules = await getTeacherModuleAnalytics(user.id);

  const school = user.schoolId
    ? await prisma.school.findUnique({ where: { id: user.schoolId } })
    : null;

  const generatedAt = new Date().toLocaleString();

  return (
    <DashboardShell
      user={user}
      title="Module monitoring report"
      subtitle="Printable summary of your modules, classes held this semester, and attendance."
      nav={lecturerNav}
    >
      <div className="report-actions mb-6 flex items-center justify-between gap-4">
        <p className="text-sm text-[var(--muted)]">Generated {generatedAt}</p>
        <PrintReportButton />
      </div>

      <article className="report-document space-y-6 rounded-2xl border border-[var(--border)] bg-white p-6 sm:p-8">
        <header className="border-b border-[var(--border)] pb-4">
          <p className="text-sm text-[var(--muted)]">
            {school
              ? formatInstitution({
                  name: school.name,
                  university: school.university,
                }).full
              : "School"}
          </p>
          <h2 className="text-xl font-semibold text-slate-900">Lecturer module report</h2>
          <p className="text-sm text-[var(--muted)]">Prepared by {user.name}</p>
        </header>

        <section>
          <h3 className="mb-3 font-semibold text-slate-900">Module attendance (current semester)</h3>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--muted)]">
                <th className="py-2 pr-4">Module</th>
                <th className="py-2 pr-4">Classes held</th>
                <th className="py-2">Attendance</th>
              </tr>
            </thead>
            <tbody>
              {modules.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-4 text-[var(--muted)]">
                    No module data recorded yet.
                  </td>
                </tr>
              ) : (
                modules.map((row) => (
                  <tr key={row.module} className="border-b border-[var(--border)]">
                    <td className="py-2 pr-4 font-medium">{row.module}</td>
                    <td className="py-2 pr-4">{row.sessionsHeld}</td>
                    <td className="py-2">{row.attendanceRate}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </article>
    </DashboardShell>
  );
}
