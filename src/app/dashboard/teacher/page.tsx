import { BookOpen, ClipboardList, Users } from "lucide-react";
import { AttendanceTrendChart } from "@/components/charts/attendance-trend-chart";
import { ClassPerformanceChart } from "@/components/charts/class-performance-chart";
import { SubjectPerformanceChart } from "@/components/charts/subject-performance-chart";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { AtRiskStudents } from "@/components/teacher/at-risk-students";
import { GradeEditor } from "@/components/teacher/grade-editor";
import { RecordAttendanceForm } from "@/components/teacher/record-attendance-form";
import { RecordGradeForm } from "@/components/teacher/record-grade-form";
import { TeacherFunctions } from "@/components/teacher/teacher-functions";
import { StatCard } from "@/components/ui/stat-card";
import { DataPanel } from "@/components/ui/data-panel";
import { requireSession } from "@/lib/auth";
import { STAFF_TEACHING_ROLES } from "@/lib/roles";
import { getStudentsRequiringAttention } from "@/lib/at-risk";
import {
  getTeacherClassAnalytics,
  getMonthlyAttendanceTrend,
  getSubjectWisePerformance,
} from "@/lib/analytics";
import { teacherNav } from "@/lib/nav";
import { getTeacherClassesWithStudents } from "@/lib/teacher";
import { prisma } from "@/lib/prisma";

export default async function TeacherDashboardPage() {
  const user = await requireSession([...STAFF_TEACHING_ROLES]);
  const classAnalytics = await getTeacherClassAnalytics(user.id);
  const classOptions = await getTeacherClassesWithStudents(user.id);
  const subjects = await getSubjectWisePerformance({ teacherId: user.id });
  const trend = await getMonthlyAttendanceTrend({ schoolId: user.schoolId ?? undefined });
  const atRisk = await getStudentsRequiringAttention(user.id);

  const classIds = classOptions.map((c) => c.id);
  const grades = await prisma.grade.findMany({
    where: { classId: { in: classIds } },
    include: {
      student: { select: { name: true } },
      class: { select: { name: true } },
    },
    orderBy: { recordedAt: "desc" },
    take: 20,
  });

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
      subtitle="Record attendance and marks, manage students, and monitor class performance."
      nav={teacherNav}
    >
      <TeacherFunctions />

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

      <div id="at-risk" className="mb-8">
        <DataPanel title="Students requiring attention">
          <AtRiskStudents students={atRisk} />
        </DataPanel>
      </div>

      <div id="class-performance" className="mb-8 grid gap-6 lg:grid-cols-2">
        <DataPanel title="Class performance dashboards">
          <ClassPerformanceChart classes={classAnalytics} />
        </DataPanel>
        <div id="attendance-trend">
          <DataPanel title="Attendance trends">
            <AttendanceTrendChart labels={trend.labels} rates={trend.rates} />
          </DataPanel>
        </div>
      </div>

      <div id="subject-performance" className="mb-8">
        <DataPanel title="Subject-wise performance">
          <SubjectPerformanceChart subjects={subjects} />
        </DataPanel>
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <div id="record-attendance">
          <DataPanel title="Record attendance">
            <RecordAttendanceForm classes={classOptions} />
          </DataPanel>
        </div>
        <div id="record-grades">
          <DataPanel title="Enter academic marks">
            <RecordGradeForm classes={classOptions} />
          </DataPanel>
        </div>
      </div>

      <div id="update-grades" className="mb-8">
        <DataPanel title="Update marks">
          <GradeEditor
            grades={grades.map((g) => ({
              id: g.id,
              title: g.title,
              score: g.score,
              maxScore: g.maxScore,
              studentName: g.student.name,
              className: g.class.name,
            }))}
          />
        </DataPanel>
      </div>
    </DashboardShell>
  );
}
