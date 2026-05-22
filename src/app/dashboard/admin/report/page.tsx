import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PrintReportButton } from "@/components/reports/print-report-button";
import { PrivacyNotice } from "@/components/ui/privacy-notice";
import { requireSession } from "@/lib/auth";
import {
  getMonthlyAttendanceTrend,
  getSchoolAnalytics,
  getSubjectWisePerformance,
} from "@/lib/analytics";
import { prisma } from "@/lib/prisma";

import { adminNav } from "@/lib/nav";
import { formatInstitution, getSchoolSettings } from "@/lib/school";

export default async function AdminReportPage() {
  const user = await requireSession(["ADMIN"]);
  const schoolMeta = user.schoolId ? await getSchoolSettings(user.schoolId) : null;
  const nav = adminNav(schoolMeta?.institutionLevel);

  if (!user.schoolId) {
    return (
      <DashboardShell user={user} title="School report" nav={nav}>
        <p className="text-sm text-[var(--muted)]">No school linked.</p>
      </DashboardShell>
    );
  }

  const school = await getSchoolAnalytics(user.schoolId);
  const subjects = await getSubjectWisePerformance({ schoolId: user.schoolId });
  const trend = await getMonthlyAttendanceTrend({ schoolId: user.schoolId });

  const classCount = await prisma.class.count({ where: { schoolId: user.schoolId } });
  const generatedAt = new Date().toLocaleString();

  if (!school) {
    return (
      <DashboardShell user={user} title="School report" nav={nav}>
        <p className="text-sm text-[var(--muted)]">School data unavailable.</p>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      user={user}
      title="School performance report"
      subtitle="Aggregated monitoring report — no individual student identifiers."
      nav={nav}
    >
      <PrivacyNotice />

      <div className="report-actions mb-6 flex items-center justify-between gap-4">
        <p className="text-sm text-[var(--muted)]">Generated {generatedAt}</p>
        <PrintReportButton />
      </div>

      <article className="report-document space-y-6 rounded-2xl border border-[var(--border)] bg-white p-6 sm:p-8">
        <header className="border-b border-[var(--border)] pb-4">
          <h2 className="text-xl font-semibold text-slate-900">{school.schoolName}</h2>
          {school.universityName ? (
            <p className="text-sm font-medium text-slate-700">{school.universityName}</p>
          ) : null}
          <p className="text-sm text-[var(--muted)]">{school.district}</p>
          <p className="mt-2 text-sm">School-wide performance summary (aggregated data only)</p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Students", value: school.studentCount },
            { label: "Classes", value: classCount },
            { label: "Attendance rate", value: `${school.attendanceRate}%` },
            { label: "Average grade", value: `${school.averageGrade}%` },
          ].map((item) => (
            <div key={item.label} className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-[var(--muted)]">{item.label}</p>
              <p className="text-2xl font-semibold text-slate-900">{item.value}</p>
            </div>
          ))}
        </section>

        <section>
          <h3 className="mb-3 font-semibold text-slate-900">Subject-wise performance</h3>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--muted)]">
                <th className="py-2 pr-4">Subject</th>
                <th className="py-2 pr-4">Classes</th>
                <th className="py-2 pr-4">Enrollments</th>
                <th className="py-2 pr-4">Attendance</th>
                <th className="py-2">Avg grade</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((s) => (
                <tr key={s.subject} className="border-b border-[var(--border)]">
                  <td className="py-2 pr-4 font-medium">{s.subject}</td>
                  <td className="py-2 pr-4">{s.classCount}</td>
                  <td className="py-2 pr-4">{s.enrollmentCount}</td>
                  <td className="py-2 pr-4">{s.attendanceRate}%</td>
                  <td className="py-2">{s.averageGrade}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h3 className="mb-3 font-semibold text-slate-900">Attendance trend</h3>
          <ul className="flex flex-wrap gap-3 text-sm">
            {trend.labels.map((label, i) => (
              <li key={label} className="rounded-lg bg-slate-50 px-3 py-2">
                <span className="text-[var(--muted)]">{label}:</span>{" "}
                <strong>{trend.rates[i]}%</strong>
              </li>
            ))}
          </ul>
        </section>

        <footer className="border-t border-[var(--border)] pt-4 text-xs text-[var(--muted)]">
          This report contains aggregated statistics only. Individual student records are
          accessible to teachers, lecturers, and students through their respective accounts.
        </footer>
      </article>
    </DashboardShell>
  );
}
