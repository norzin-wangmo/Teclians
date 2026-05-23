import { ClipboardCheck, FileText, Lock, TrendingUp } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StudentModulesOverview } from "@/components/student/student-modules-overview";
import { DataPanel } from "@/components/ui/data-panel";
import { StatCard } from "@/components/ui/stat-card";
import { requireSession } from "@/lib/auth";
import { getStudentAnalytics } from "@/lib/analytics";
import { getInstitutionBranding } from "@/lib/institution";
import { studentNav } from "@/lib/nav";
import { getStudentEnrollmentSummaries } from "@/lib/student-enrollment-summary";
import { prisma } from "@/lib/prisma";

export default async function StudentDashboardPage() {
  const user = await requireSession(["STUDENT"]);
  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { name: true, studentNumber: true, department: true, yearOfStudy: true },
  });

  if (!profile) {
    return (
      <DashboardShell user={user} title="My academic records" nav={studentNav}>
        <p className="text-sm text-[var(--muted)]">
          Your account could not be loaded. Sign out and sign in again.
        </p>
      </DashboardShell>
    );
  }

  const [analytics, modules, institution] = await Promise.all([
    getStudentAnalytics(user.id),
    getStudentEnrollmentSummaries(user.id),
    getInstitutionBranding(user.schoolId),
  ]);

  return (
    <DashboardShell
      user={user}
      title="My academic records"
      subtitle={[
        profile.name,
        profile.studentNumber ? `ID: ${profile.studentNumber}` : null,
        profile.department ? profile.department : null,
        profile.yearOfStudy ? profile.yearOfStudy : null,
      ]
        .filter(Boolean)
        .join(" · ")}
      nav={studentNav}
      institution={institution}
    >
      <div className="mb-6 flex gap-3 rounded-xl border border-brand-100 bg-brand-50/80 px-4 py-3 text-sm text-brand-900">
        <Lock className="mt-0.5 h-5 w-5 shrink-0" />
        <p>
          Your account is restricted to <strong>your personal records only</strong>. Below are
          your enrolled modules with attendance and grades; use the menu for full marks and trends.
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Attendance rate"
          value={`${analytics.attendance.rate}%`}
          hint={`${analytics.attendance.present} present · ${analytics.attendance.absent} absent`}
          icon={ClipboardCheck}
          tone="forest"
        />
        <StatCard
          label="Average grade"
          value={`${analytics.grades.averagePercent}%`}
          hint={`${analytics.grades.count} assessments`}
          icon={TrendingUp}
          tone="brand"
        />
        <StatCard
          label="Enrolled modules"
          value={modules.length}
          icon={FileText}
          tone="amber"
        />
      </div>

      <DataPanel title="My enrolled modules">
        <StudentModulesOverview modules={modules} />
      </DataPanel>
    </DashboardShell>
  );
}
