import { prisma } from "@/lib/prisma";
import { summarizeAttendance } from "@/lib/analytics";

export type AtRiskStudent = {
  id: string;
  studentNumber: string;
  name: string;
  email: string;
  attendanceRate: number;
  averageGrade: number;
  reasons: string[];
};

const ATTENDANCE_THRESHOLD = 80;
const GRADE_THRESHOLD = 65;

export async function getStudentsRequiringAttention(
  teacherId: string,
): Promise<AtRiskStudent[]> {
  const classes = await prisma.class.findMany({
    where: { teacherId },
    select: { id: true },
  });
  const classIds = classes.map((c) => c.id);
  if (classIds.length === 0) return [];

  const enrollments = await prisma.enrollment.findMany({
    where: { classId: { in: classIds } },
    include: {
      student: { select: { id: true, name: true, email: true, studentNumber: true } },
    },
  });

  const studentIds = [...new Set(enrollments.map((e) => e.studentId))];
  const results: AtRiskStudent[] = [];

  for (const studentId of studentIds) {
    const student = enrollments.find((e) => e.studentId === studentId)?.student;
    if (!student) continue;

    const [attendance, grades] = await Promise.all([
      prisma.attendanceRecord.findMany({
        where: { studentId, classId: { in: classIds } },
        select: { status: true },
      }),
      prisma.grade.findMany({
        where: { studentId, classId: { in: classIds } },
        select: { score: true, maxScore: true },
      }),
    ]);

    const attendanceSummary = summarizeAttendance(attendance);
    const averageGrade =
      grades.length === 0
        ? 100
        : Math.round(
            (grades.reduce((s, g) => s + (g.score / g.maxScore) * 100, 0) / grades.length) * 10,
          ) / 10;

    const reasons: string[] = [];
    if (attendance.length > 0 && attendanceSummary.rate < ATTENDANCE_THRESHOLD) {
      reasons.push(`Low attendance (${attendanceSummary.rate}%)`);
    }
    if (grades.length > 0 && averageGrade < GRADE_THRESHOLD) {
      reasons.push(`Low average grade (${averageGrade}%)`);
    }

    if (reasons.length > 0) {
      results.push({
        id: student.id,
        studentNumber: student.studentNumber ?? student.name,
        name: student.name,
        email: student.email,
        attendanceRate: attendanceSummary.rate,
        averageGrade,
        reasons,
      });
    }
  }

  return results.sort((a, b) => a.averageGrade - b.averageGrade);
}
