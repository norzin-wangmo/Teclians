import { BookOpen, ClipboardList, Users } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatCard } from "@/components/ui/stat-card";
import { requireSession } from "@/lib/auth";
import { getTeacherClassAnalytics } from "@/lib/analytics";
import { getInstitutionBranding } from "@/lib/institution";
import { teacherNav } from "@/lib/nav";
import { STAFF_TEACHING_ROLES } from "@/lib/roles";
import { getTeacherClassesWithStudents } from "@/lib/teacher";

export default async function TeacherDashboardPage() {
  const user = await requireSession([...STAFF_TEACHING_ROLES]);
  const [classAnalytics, classOptions, institution] = await Promise.all([
    getTeacherClassAnalytics(user.id),
    getTeacherClassesWithStudents(user.id),
    getInstitutionBranding(user.schoolId),
  ]);

  const studentCount = classOptions.reduce((sum, c) => sum + c.students.length, 0);
  const avgAttendance =
    classAnalytics.length === 0
      ? 0
      : Math.round(
          (classAnalytics.reduce((s, c) => s + c.attendanceRate, 0) / classAnalytics.length) * 10,
        ) / 10;

  return (
    <DashboardShell
      user={user}
      title="Teacher dashboard"
      subtitle="Use the menu to record attendance and marks, manage students, and view performance."
      nav={teacherNav}
      institution={institution}
    >
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Classes" value={classOptions.length} icon={BookOpen} tone="blue" />
        <StatCard
          label="Students"
          value={studentCount}
          hint="Across all your classes"
          icon={Users}
          tone="teal"
        />
        <StatCard
          label="Avg attendance"
          value={`${avgAttendance}%`}
          icon={ClipboardList}
          tone="amber"
        />
      </div>
    </DashboardShell>
  );
}
