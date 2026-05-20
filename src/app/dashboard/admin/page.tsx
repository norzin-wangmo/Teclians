import { Building2, GraduationCap, Users } from "lucide-react";
import { AttendanceTrendChart } from "@/components/charts/attendance-trend-chart";
import { ClassPerformanceChart } from "@/components/charts/class-performance-chart";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatCard } from "@/components/ui/stat-card";
import { DataPanel } from "@/components/ui/data-panel";
import { PrivacyNotice } from "@/components/ui/privacy-notice";
import { requireSession } from "@/lib/auth";
import { getMonthlyAttendanceTrend, getSchoolAnalytics } from "@/lib/analytics";
import { adminNav } from "@/lib/nav";
import { prisma } from "@/lib/prisma";
import { formatInstitution } from "@/lib/school";
import { summarizeAttendance } from "@/lib/analytics";

export default async function AdminDashboardPage() {
  const user = await requireSession(["ADMIN"]);
  if (!user.schoolId) {
    return (
      <DashboardShell user={user} title="School administrator dashboard" nav={adminNav}>
        <p className="text-sm text-[var(--muted)]">No school is linked to this account.</p>
      </DashboardShell>
    );
  }

  const school = await getSchoolAnalytics(user.schoolId);
  const trend = await getMonthlyAttendanceTrend({ schoolId: user.schoolId });

  const classes = await prisma.class.findMany({
    where: { schoolId: user.schoolId },
    include: { teacher: { select: { name: true } } },
  });

  const classAnalytics = await Promise.all(
    classes.map(async (cls) => {
      const [records, grades, enrollments] = await Promise.all([
        prisma.attendanceRecord.findMany({
          where: { classId: cls.id },
          select: { status: true },
        }),
        prisma.grade.findMany({
          where: { classId: cls.id },
          select: { score: true, maxScore: true },
        }),
        prisma.enrollment.count({ where: { classId: cls.id } }),
      ]);
      const attendance = summarizeAttendance(records);
      const averageGrade =
        grades.length === 0
          ? 0
          : Math.round(
              (grades.reduce((s, g) => s + (g.score / g.maxScore) * 100, 0) / grades.length) * 10,
            ) / 10;

      return {
        classId: cls.id,
        className: cls.name,
        subject: cls.subject,
        attendanceRate: attendance.rate,
        averageGrade,
        studentCount: enrollments,
      };
    }),
  );

  const teachers = await prisma.user.count({
    where: { schoolId: user.schoolId, role: { in: ["TEACHER", "LECTURER"] } },
  });

  return (
    <DashboardShell
      user={user}
      title="School administration"
      subtitle={
        school
          ? `${formatInstitution({ name: school.schoolName, university: school.universityName }).full} · ${school.district} — use the menu for cohort performance, students, and teachers.`
          : "School-wide analytics"
      }
      nav={adminNav}
    >
      <PrivacyNotice />

      {school ? (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Students" value={school.studentCount} icon={Users} tone="blue" />
            <StatCard label="Classes" value={school.classCount} icon={GraduationCap} tone="teal" />
            <StatCard
              label="Attendance rate"
              value={`${school.attendanceRate}%`}
              icon={Building2}
              tone="amber"
            />
            <StatCard
              label="Average grade"
              value={`${school.averageGrade}%`}
              hint={`${teachers} teachers`}
              icon={GraduationCap}
              tone="rose"
            />
          </div>

          <div className="mb-8 grid gap-6 lg:grid-cols-2">
            <DataPanel title="School attendance trend">
              <AttendanceTrendChart labels={trend.labels} rates={trend.rates} />
            </DataPanel>
            <DataPanel title="Performance by class (aggregated)">
              <ClassPerformanceChart classes={classAnalytics} />
            </DataPanel>
          </div>

          <DataPanel title="Classes & staffing (no student identifiers)">
            <ul className="divide-y divide-[var(--border)]">
              {classes.map((cls) => {
                const stats = classAnalytics.find((c) => c.classId === cls.id);
                return (
                  <li key={cls.id} className="flex justify-between gap-4 py-3 text-sm">
                    <div>
                      <p className="font-medium text-slate-900">{cls.name}</p>
                      <p className="text-[var(--muted)]">
                        {cls.subject} · Teacher: {cls.teacher.name}
                      </p>
                    </div>
                    {stats ? (
                      <div className="text-right text-[var(--muted)]">
                        <p>{stats.studentCount} enrolled</p>
                        <p>
                          {stats.attendanceRate}% att. · {stats.averageGrade}% avg
                        </p>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </DataPanel>
        </>
      ) : null}
    </DashboardShell>
  );
}
