import { DashboardShell } from "@/components/layout/dashboard-shell";
import { TeacherRecordPanel } from "@/components/teacher/teacher-record-panel";
import { requireSession } from "@/lib/auth";
import { getInstitutionBranding } from "@/lib/institution";
import { lecturerNav } from "@/lib/nav";
import { STAFF_TEACHING_ROLES } from "@/lib/roles";
import { getTeacherClassesWithStudents } from "@/lib/teacher";
import { prisma } from "@/lib/prisma";

export default async function TeacherRecordPage() {
  const user = await requireSession([...STAFF_TEACHING_ROLES]);
  const classOptions = await getTeacherClassesWithStudents(user.id);
  const institution = await getInstitutionBranding(user.schoolId);

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

  const gradeRows = grades.map((g) => ({
    id: g.id,
    title: g.title,
    score: g.score,
    maxScore: g.maxScore,
    studentName: g.student.name,
    className: g.class.name,
  }));

  return (
    <DashboardShell
      user={user}
      title="Record class data"
      subtitle="Attendance, assignment marks, quizzes, and updating existing marks."
      nav={lecturerNav}
      institution={institution}
    >
      <TeacherRecordPanel classes={classOptions} grades={gradeRows} />
    </DashboardShell>
  );
}
