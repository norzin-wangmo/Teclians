import { DashboardShell } from "@/components/layout/dashboard-shell";
import { AttendanceTrendChart } from "@/components/charts/attendance-trend-chart";
import { ModulePerformanceChart } from "@/components/charts/module-performance-chart";
import { DataPanel } from "@/components/ui/data-panel";
import { requireSession } from "@/lib/auth";
import { getMonthlyAttendanceTrend, getTeacherModuleAnalytics } from "@/lib/analytics";
import { getInstitutionBranding } from "@/lib/institution";
import { lecturerNav } from "@/lib/nav";
import { STAFF_TEACHING_ROLES } from "@/lib/roles";

export default async function TeacherPerformancePage() {
  const user = await requireSession([...STAFF_TEACHING_ROLES]);
  const [modules, trend, institution] = await Promise.all([
    getTeacherModuleAnalytics(user.id),
    getMonthlyAttendanceTrend({ schoolId: user.schoolId ?? undefined }),
    getInstitutionBranding(user.schoolId),
  ]);

  return (
    <DashboardShell
      user={user}
      title="Module performance"
      subtitle="Visual analytics for your modules and attendance trends."
      nav={lecturerNav}
      institution={institution}
    >
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <DataPanel title="Module-wise performance dashboard">
          <ModulePerformanceChart modules={modules} />
        </DataPanel>
        <DataPanel title="Attendance trends">
          <AttendanceTrendChart labels={trend.labels} rates={trend.rates} />
        </DataPanel>
      </div>
    </DashboardShell>
  );
}
