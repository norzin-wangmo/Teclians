import { DashboardShell } from "@/components/layout/dashboard-shell";
import { AttendanceTrendChart } from "@/components/charts/attendance-trend-chart";
import { ClassPerformanceChart } from "@/components/charts/class-performance-chart";
import { SubjectPerformanceChart } from "@/components/charts/subject-performance-chart";
import { DataPanel } from "@/components/ui/data-panel";
import { requireSession } from "@/lib/auth";
import {
  getTeacherClassAnalytics,
  getMonthlyAttendanceTrend,
  getSubjectWisePerformance,
} from "@/lib/analytics";
import { getInstitutionBranding } from "@/lib/institution";
import { teacherNav } from "@/lib/nav";
import { STAFF_TEACHING_ROLES } from "@/lib/roles";

export default async function TeacherPerformancePage() {
  const user = await requireSession([...STAFF_TEACHING_ROLES]);
  const [classAnalytics, subjects, trend, institution] = await Promise.all([
    getTeacherClassAnalytics(user.id),
    getSubjectWisePerformance({ teacherId: user.id }),
    getMonthlyAttendanceTrend({ schoolId: user.schoolId ?? undefined }),
    getInstitutionBranding(user.schoolId),
  ]);

  return (
    <DashboardShell
      user={user}
      title="Class performance"
      subtitle="Visual analytics for your classes and subjects."
      nav={teacherNav}
      institution={institution}
    >
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <DataPanel title="Class performance dashboards">
          <ClassPerformanceChart classes={classAnalytics} />
        </DataPanel>
        <DataPanel title="Attendance trends">
          <AttendanceTrendChart labels={trend.labels} rates={trend.rates} />
        </DataPanel>
      </div>
      <DataPanel title="Subject-wise performance">
        <SubjectPerformanceChart subjects={subjects} />
      </DataPanel>
    </DashboardShell>
  );
}
