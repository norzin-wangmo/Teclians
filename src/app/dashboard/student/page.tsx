import { ClipboardCheck, FileText, Lock, TrendingUp } from "lucide-react";
import { AttendanceTrendChart } from "@/components/charts/attendance-trend-chart";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StudentFunctions } from "@/components/student/student-functions";
import { StatCard } from "@/components/ui/stat-card";
import { DataPanel } from "@/components/ui/data-panel";
import { requireSession } from "@/lib/auth";
import { getStudentAnalytics, getMonthlyAttendanceTrend } from "@/lib/analytics";
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
  const analytics = await getStudentAnalytics(user.id);
  const trend = await getMonthlyAttendanceTrend({ studentId: user.id });

  const [enrollments, attendanceRecords, grades] = await Promise.all([
    prisma.enrollment.findMany({
      where: { studentId: user.id },
      include: { class: { select: { name: true, subject: true } } },
    }),
    prisma.attendanceRecord.findMany({
      where: { studentId: user.id },
      include: { class: { select: { name: true, subject: true } } },
      orderBy: { date: "desc" },
      take: 30,
    }),
    prisma.grade.findMany({
      where: { studentId: user.id },
      include: { class: { select: { name: true, subject: true } } },
      orderBy: { recordedAt: "desc" },
    }),
  ]);

  const marksBySubject = grades.reduce<
    Record<string, { subject: string; items: typeof grades }>
  >((acc, grade) => {
    const subject = grade.class.subject;
    if (!acc[subject]) acc[subject] = { subject, items: [] };
    acc[subject].items.push(grade);
    return acc;
  }, {});

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
    >
      <div className="mb-6 flex gap-3 rounded-xl border border-teal-100 bg-teal-50/80 px-4 py-3 text-sm text-teal-900">
        <Lock className="mt-0.5 h-5 w-5 shrink-0" />
        <p>
          Your account is restricted to <strong>your personal records only</strong>. Other
          students&apos; data is not visible to you.
        </p>
      </div>

      <StudentFunctions />

      <div id="progress" className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
          value={enrollments.length}
          icon={FileText}
          tone="amber"
        />
      </div>

      <div id="trends" className="mb-8 grid gap-6 lg:grid-cols-2">
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
              <span>Subjects with marks</span>
              <strong>{Object.keys(marksBySubject).length}</strong>
            </li>
          </ul>
        </DataPanel>
      </div>

      <div id="attendance-records" className="mb-8">
        <DataPanel title="Attendance records">
          {attendanceRecords.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">No attendance records yet.</p>
          ) : (
            <ul className="max-h-80 divide-y divide-[var(--border)] overflow-y-auto">
              {attendanceRecords.map((record) => (
                <li
                  key={record.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm"
                >
                  <div>
                    <p className="font-medium text-slate-900">{record.class.name}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {record.class.subject} · {record.date.toLocaleDateString()}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium">
                    {record.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </DataPanel>
      </div>

      <div id="subject-marks">
        <DataPanel title="Subject marks">
          {Object.keys(marksBySubject).length === 0 ? (
            <p className="text-sm text-[var(--muted)]">No marks recorded yet.</p>
          ) : (
            <div className="space-y-6">
              {Object.values(marksBySubject).map((group) => {
                const avg =
                  group.items.length === 0
                    ? 0
                    : Math.round(
                        (group.items.reduce((s, g) => s + (g.score / g.maxScore) * 100, 0) /
                          group.items.length) *
                          10,
                      ) / 10;
                return (
                  <div key={group.subject}>
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="font-semibold text-slate-900">{group.subject}</h3>
                      <span className="text-xs text-[var(--muted)]">Avg {avg}%</span>
                    </div>
                    <ul className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)]">
                      {group.items.map((grade) => (
                        <li
                          key={grade.id}
                          className="flex justify-between px-3 py-2 text-sm"
                        >
                          <div>
                            <p className="font-medium">{grade.title}</p>
                            <p className="text-xs text-[var(--muted)]">{grade.class.name}</p>
                          </div>
                          <p className="font-semibold">
                            {grade.score}/{grade.maxScore}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </DataPanel>
      </div>
    </DashboardShell>
  );
}
