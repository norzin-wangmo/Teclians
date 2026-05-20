import { ClipboardCheck, FileText, Lock, TrendingUp } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatCard } from "@/components/ui/stat-card";
import { requireSession } from "@/lib/auth";
import { getStudentAnalytics } from "@/lib/analytics";
import { getInstitutionBranding } from "@/lib/institution";
import { studentNav } from "@/lib/nav";
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

  const [analytics, enrollments, institution] = await Promise.all([
    getStudentAnalytics(user.id),
    prisma.enrollment.count({ where: { studentId: user.id } }),
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
      <div className="mb-6 flex gap-3 rounded-xl border border-teal-100 bg-teal-50/80 px-4 py-3 text-sm text-teal-900">
        <Lock className="mt-0.5 h-5 w-5 shrink-0" />
        <p>
          Your account is restricted to <strong>your personal records only</strong>. Use the menu
          above to open attendance, marks, and trends.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Attendance rate"
          value={`${analytics.attendance.rate}%`}
          hint={`${analytics.attendance.present} present · ${analytics.attendance.absent} absent`}
          icon={ClipboardCheck}
          tone="teal"
        />
        <StatCard
          label="Average grade"
          value={`${analytics.grades.averagePercent}%`}
          hint={`${analytics.grades.count} assessments`}
          icon={TrendingUp}
          tone="blue"
        />
        <StatCard
          label="Enrolled classes"
          value={enrollments}
          icon={FileText}
          tone="amber"
        />
      </div>
    </DashboardShell>
  );
}
