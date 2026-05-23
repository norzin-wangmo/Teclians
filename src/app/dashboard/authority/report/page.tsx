import { DashboardShell } from "@/components/layout/dashboard-shell";
import { MinistryBadge } from "@/components/layout/ministry-badge";
import { PrintReportButton } from "@/components/reports/print-report-button";
import { MINISTRY_NAME } from "@/lib/brand";
import { PrivacyNotice } from "@/components/ui/privacy-notice";
import { requireSession } from "@/lib/auth";
import { getAuthorityAnalytics } from "@/lib/analytics";

import { authorityNav } from "@/lib/nav";

export default async function AuthorityReportPage() {
  const user = await requireSession(["AUTHORITY"]);
  const schools = await getAuthorityAnalytics();
  const generatedAt = new Date().toLocaleString();

  const totalStudents = schools.reduce((s, x) => s + x.studentCount, 0);
  const avgAttendance =
    schools.length === 0
      ? 0
      : Math.round(
          (schools.reduce((s, x) => s + x.attendanceRate, 0) / schools.length) * 10,
        ) / 10;
  const avgGrades =
    schools.length === 0
      ? 0
      : Math.round(
          (schools.reduce((s, x) => s + x.averageGrade, 0) / schools.length) * 10,
        ) / 10;

  const byDistrict = schools.reduce<
    Record<string, { schools: number; students: number; attendance: number; grades: number }>
  >((acc, school) => {
    const d = acc[school.district] ?? { schools: 0, students: 0, attendance: 0, grades: 0 };
    d.schools += 1;
    d.students += school.studentCount;
    d.attendance += school.attendanceRate;
    d.grades += school.averageGrade;
    acc[school.district] = d;
    return acc;
  }, {});

  return (
    <DashboardShell
      user={user}
      title="Regional monitoring report"
      subtitle="District-level comparative educational statistics for ministry planning."
      nav={authorityNav}
    >
      <PrivacyNotice />

      <div className="report-actions mb-6 flex items-center justify-between gap-4">
        <p className="text-sm text-[var(--muted)]">Generated {generatedAt}</p>
        <PrintReportButton label="Print regional report" />
      </div>

      <article className="report-document space-y-6 rounded-2xl border border-[var(--border)] bg-white p-6 sm:p-8">
        <header className="border-b border-[var(--border)] pb-4">
          <MinistryBadge size="md" className="mb-4" />
          <h2 className="text-xl font-semibold text-slate-900">
            {MINISTRY_NAME} — Regional Summary
          </h2>
          <p className="text-sm text-[var(--muted)]">
            Comparative school performance · expandable to nationwide monitoring
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Schools monitored", value: schools.length },
            { label: "Total students", value: totalStudents },
            { label: "Regional avg attendance", value: `${avgAttendance}%` },
            { label: "Regional avg grade", value: `${avgGrades}%` },
          ].map((item) => (
            <div key={item.label} className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-[var(--muted)]">{item.label}</p>
              <p className="text-2xl font-semibold text-slate-900">{item.value}</p>
            </div>
          ))}
        </section>

        <section>
          <h3 className="mb-3 font-semibold text-slate-900">District summaries</h3>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--muted)]">
                <th className="py-2 pr-4">District</th>
                <th className="py-2 pr-4">Schools</th>
                <th className="py-2 pr-4">Students</th>
                <th className="py-2 pr-4">Avg attendance</th>
                <th className="py-2">Avg grade</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(byDistrict).map(([district, stats]) => (
                <tr key={district} className="border-b border-[var(--border)]">
                  <td className="py-2 pr-4 font-medium">{district}</td>
                  <td className="py-2 pr-4">{stats.schools}</td>
                  <td className="py-2 pr-4">{stats.students}</td>
                  <td className="py-2 pr-4">
                    {Math.round((stats.attendance / stats.schools) * 10) / 10}%
                  </td>
                  <td className="py-2">
                    {Math.round((stats.grades / stats.schools) * 10) / 10}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h3 className="mb-3 font-semibold text-slate-900">School comparison</h3>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--muted)]">
                <th className="py-2 pr-4">School</th>
                <th className="py-2 pr-4">District</th>
                <th className="py-2 pr-4">Students</th>
                <th className="py-2 pr-4">Attendance</th>
                <th className="py-2">Avg grade</th>
              </tr>
            </thead>
            <tbody>
              {schools.map((school) => (
                <tr key={school.schoolId} className="border-b border-[var(--border)]">
                  <td className="py-2 pr-4 font-medium">
                    {school.schoolName}
                    {school.universityName ? (
                      <span className="mt-0.5 block text-xs font-normal text-[var(--muted)]">
                        {school.universityName}
                      </span>
                    ) : null}
                  </td>
                  <td className="py-2 pr-4">{school.district}</td>
                  <td className="py-2 pr-4">{school.studentCount}</td>
                  <td className="py-2 pr-4">{school.attendanceRate}%</td>
                  <td className="py-2">{school.averageGrade}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <footer className="border-t border-[var(--border)] pt-4 text-xs text-[var(--muted)]">
          Ministry officials view aggregated data only. Individual student academic records remain
          within school-level teacher and student access controls.
        </footer>
      </article>
    </DashboardShell>
  );
}
