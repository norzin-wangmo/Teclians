import Link from "next/link";
import { Building2, FileBarChart, MapPin, TrendingUp } from "lucide-react";
import { SchoolComparisonChart } from "@/components/charts/school-comparison-chart";
import { DistrictTrendChart } from "@/components/charts/district-trend-chart";
import { MinistryFunctions } from "@/components/authority/ministry-functions";
import { RubCollegesList } from "@/components/authority/rub-colleges-list";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatCard } from "@/components/ui/stat-card";
import { DataPanel } from "@/components/ui/data-panel";
import { PrivacyNotice } from "@/components/ui/privacy-notice";
import { requireSession } from "@/lib/auth";
import { getAuthorityAnalytics } from "@/lib/analytics";
import { getDistrictSummaries } from "@/lib/analytics-district";
import { authorityNav } from "@/lib/nav";

export default async function AuthorityDashboardPage() {
  const user = await requireSession(["AUTHORITY"]);
  const [schools, districtSummaries] = await Promise.all([
    getAuthorityAnalytics(),
    getDistrictSummaries(),
  ]);

  const totalStudents = schools.reduce((s, school) => s + school.studentCount, 0);
  const avgAttendance =
    schools.length === 0
      ? 0
      : Math.round(
          (schools.reduce((s, school) => s + school.attendanceRate, 0) / schools.length) * 10,
        ) / 10;
  const avgGrades =
    schools.length === 0
      ? 0
      : Math.round(
          (schools.reduce((s, school) => s + school.averageGrade, 0) / schools.length) * 10,
        ) / 10;

  const districtCount = new Set(schools.map((s) => s.district)).size;

  return (
    <DashboardShell
      user={user}
      title="Ministry education analytics"
      subtitle="District and school-level comparative statistics. Designed for nationwide expansion from school-level deployment."
      nav={authorityNav}
    >
      <MinistryFunctions />
      <RubCollegesList />
      <PrivacyNotice />

      <div className="mb-6 flex justify-end">
        <Link
          href="/dashboard/authority/report"
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <FileBarChart className="h-4 w-4" />
          Regional monitoring report
        </Link>
      </div>

      <div id="analytics" className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Schools" value={schools.length} icon={Building2} tone="brand" />
        <StatCard label="Total students" value={totalStudents} icon={TrendingUp} tone="forest" />
        <StatCard label="Avg attendance" value={`${avgAttendance}%`} icon={MapPin} tone="amber" />
        <StatCard
          label="Avg grade"
          value={`${avgGrades}%`}
          hint={`${districtCount} districts · expandable to nationwide`}
          icon={TrendingUp}
          tone="rose"
        />
      </div>

      <div id="district-trends" className="mb-8">
        <DataPanel title="District-level trends">
          <DistrictTrendChart districts={districtSummaries} />
        </DataPanel>
      </div>

      <div id="comparison" className="mb-8 grid gap-6 lg:grid-cols-2">
        <DataPanel title="Compare school performance">
          <SchoolComparisonChart schools={schools} />
        </DataPanel>

        <DataPanel title="School performance summaries">
          <ul className="divide-y divide-[var(--border)]">
            {schools.map((school) => (
              <li key={school.schoolId} className="py-3 text-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-slate-900">
                      {school.schoolName}
                      <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-normal uppercase tracking-wide text-slate-600">
                        {school.institutionLevel === "COLLEGE" ? "RUB college" : "School"}
                      </span>
                    </p>
                    {school.universityName ? (
                      <p className="text-xs text-slate-700">{school.universityName}</p>
                    ) : null}
                    <p className="text-[var(--muted)]">{school.district}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">{school.attendanceRate}% att.</p>
                    <p className="text-[var(--muted)]">{school.averageGrade}% avg grade</p>
                  </div>
                </div>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {school.studentCount} students · {school.classCount} classes
                </p>
              </li>
            ))}
          </ul>
        </DataPanel>
      </div>
    </DashboardShell>
  );
}
