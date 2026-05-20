import { TrendingUp } from "lucide-react";
import { AttendanceTrendChart } from "@/components/charts/attendance-trend-chart";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { DataPanel } from "@/components/ui/data-panel";
import { StatCard } from "@/components/ui/stat-card";
import { requireSession } from "@/lib/auth";
import { getStudentAnalytics, getMonthlyAttendanceTrend } from "@/lib/analytics";
import { getInstitutionBranding } from "@/lib/institution";
import { studentNav } from "@/lib/nav";
import { prisma } from "@/lib/prisma";

export default async function StudentTrendsPage() {
  const user = await requireSession(["STUDENT"]);
  const [analytics, trend, enrollments, institution] = await Promise.all([
    getStudentAnalytics(user.id),
    getMonthlyAttendanceTrend({ studentId: user.id }),
    prisma.enrollment.count({ where: { studentId: user.id } }),
    getInstitutionBranding(user.schoolId),
  ]);

  return (
    <DashboardShell
      user={user}
      title="Progress & trends"
      subtitle="Performance trends and summary statistics."
      nav={studentNav}
      institution={institution}
    >
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Attendance rate"
          value={`${analytics.attendance.rate}%`}
          icon={TrendingUp}
          tone="teal"
        />
        <StatCard
          label="Average grade"
          value={`${analytics.grades.averagePercent}%`}
          hint={`${enrollments} class${enrollments === 1 ? "" : "es"}`}
          icon={TrendingUp}
          tone="blue"
        />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <DataPanel title="Performance trends">
          <AttendanceTrendChart labels={trend.labels} rates={trend.rates} />
        </DataPanel>
        <DataPanel title="Academic progress summary">
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between rounded-lg bg-slate-50 px-3 py-2">
              <span>Overall attendance</span>
              <strong>{analytics.attendance.rate}%</strong>
            </li>
            <li className="flex justify-between rounded-lg bg-slate-50 px-3 py-2">
              <span>Overall average grade</span>
              <strong>{analytics.grades.averagePercent}%</strong>
            </li>
            <li className="flex justify-between rounded-lg bg-slate-50 px-3 py-2">
              <span>Assessments recorded</span>
              <strong>{analytics.grades.count}</strong>
            </li>
          </ul>
        </DataPanel>
      </div>
    </DashboardShell>
  );
}
