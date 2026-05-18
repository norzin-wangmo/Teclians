import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PrintReportButton } from "@/components/reports/print-report-button";
import { requireSession } from "@/lib/auth";
import { STAFF_TEACHING_ROLES } from "@/lib/roles";
import {
  getMonthlyAttendanceTrend,
  getSubjectWisePerformance,
  getTeacherClassAnalytics,
} from "@/lib/analytics";
import { prisma } from "@/lib/prisma";

import { teacherNav } from "@/lib/nav";
import { formatInstitution } from "@/lib/school";

export default async function TeacherReportPage() {
  const user = await requireSession([...STAFF_TEACHING_ROLES]);
  const classes = await getTeacherClassAnalytics(user.id);
  const subjects = await getSubjectWisePerformance({ teacherId: user.id });
  const trend = await getMonthlyAttendanceTrend({ schoolId: user.schoolId ?? undefined });

  const school = user.schoolId
    ? await prisma.school.findUnique({ where: { id: user.schoolId } })
    : null;

  const generatedAt = new Date().toLocaleString();

  return (
    <DashboardShell
      user={user}
      title="Class monitoring report"
      subtitle="Printable summary of your classes, attendance trends, and subject performance."
      nav={teacherNav}
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
          <h2 className="text-xl font-semibold text-slate-900">Teacher class report</h2>
          <p className="text-sm text-[var(--muted)]">Prepared by {user.name}</p>
        </header>

        <section>
          <h3 className="mb-3 font-semibold text-slate-900">Class summary</h3>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--muted)]">
                <th className="py-2 pr-4">Class</th>
                <th className="py-2 pr-4">Subject</th>
                <th className="py-2 pr-4">Students</th>
                <th className="py-2 pr-4">Attendance</th>
                <th className="py-2">Avg grade</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((cls) => (
                <tr key={cls.classId} className="border-b border-[var(--border)]">
                  <td className="py-2 pr-4 font-medium">{cls.className}</td>
                  <td className="py-2 pr-4">{cls.subject}</td>
                  <td className="py-2 pr-4">{cls.studentCount}</td>
                  <td className="py-2 pr-4">{cls.attendanceRate}%</td>
                  <td className="py-2">{cls.averageGrade}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h3 className="mb-3 font-semibold text-slate-900">Subject-wise performance</h3>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--muted)]">
                <th className="py-2 pr-4">Subject</th>
                <th className="py-2 pr-4">Classes</th>
                <th className="py-2 pr-4">Attendance</th>
                <th className="py-2">Avg grade</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((s) => (
                <tr key={s.subject} className="border-b border-[var(--border)]">
                  <td className="py-2 pr-4 font-medium">{s.subject}</td>
                  <td className="py-2 pr-4">{s.classCount}</td>
                  <td className="py-2 pr-4">{s.attendanceRate}%</td>
                  <td className="py-2">{s.averageGrade}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h3 className="mb-3 font-semibold text-slate-900">Attendance trend (6 months)</h3>
          <ul className="flex flex-wrap gap-3 text-sm">
            {trend.labels.map((label, i) => (
              <li key={label} className="rounded-lg bg-slate-50 px-3 py-2">
                <span className="text-[var(--muted)]">{label}:</span>{" "}
                <strong>{trend.rates[i]}%</strong>
              </li>
            ))}
          </ul>
        </section>
      </article>
    </DashboardShell>
  );
}
