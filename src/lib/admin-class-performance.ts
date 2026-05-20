import { prisma } from "@/lib/prisma";
import { summarizeAttendance } from "@/lib/analytics";

export type CohortFilter = {
  department: string;
  yearOfStudy: string;
};

export type ModulePerformance = {
  classId: string;
  className: string;
  subject: string;
  averageGrade: number;
  attendanceRate: number;
  studentCount: number;
};

export type CohortAtRiskStudent = {
  id: string;
  name: string;
  studentNumber: string;
  attendanceRate: number;
  department: string | null;
  yearOfStudy: string | null;
};

const ATTENDANCE_RISK_THRESHOLD = 90;

export async function getAdminCohortFilters(schoolId: string): Promise<CohortFilter[]> {
  const students = await prisma.user.findMany({
    where: { schoolId, role: "STUDENT" },
    select: { department: true, yearOfStudy: true },
  });

  const keys = new Set<string>();
  const filters: CohortFilter[] = [];

  for (const s of students) {
    const department = s.department?.trim() || "General";
    const yearOfStudy = s.yearOfStudy?.trim() || "Unspecified";
    const key = `${department}::${yearOfStudy}`;
    if (!keys.has(key)) {
      keys.add(key);
      filters.push({ department, yearOfStudy });
    }
  }

  return filters.sort((a, b) => {
    const year = a.yearOfStudy.localeCompare(b.yearOfStudy);
    if (year !== 0) return year;
    return a.department.localeCompare(b.department);
  });
}

export async function getCohortClassPerformance(
  schoolId: string,
  cohort: CohortFilter,
): Promise<{ modules: ModulePerformance[]; atRisk: CohortAtRiskStudent[] }> {
  const department = cohort.department === "General" ? null : cohort.department;
  const yearOfStudy = cohort.yearOfStudy === "Unspecified" ? null : cohort.yearOfStudy;

  const students = await prisma.user.findMany({
    where: {
      schoolId,
      role: "STUDENT",
      ...(department ? { department } : { OR: [{ department: null }, { department: "" }] }),
      ...(yearOfStudy
        ? { yearOfStudy }
        : { OR: [{ yearOfStudy: null }, { yearOfStudy: "" }] }),
    },
    select: {
      id: true,
      name: true,
      studentNumber: true,
      department: true,
      yearOfStudy: true,
    },
  });

  const studentIds = students.map((s) => s.id);
  if (studentIds.length === 0) {
    return { modules: [], atRisk: [] };
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: { in: studentIds } },
    include: {
      class: { select: { id: true, name: true, subject: true, schoolId: true } },
    },
  });

  const classIds = [...new Set(enrollments.map((e) => e.classId))];
  const modules: ModulePerformance[] = [];

  for (const classId of classIds) {
    const cls = enrollments.find((e) => e.classId === classId)?.class;
    if (!cls || cls.schoolId !== schoolId) continue;

    const cohortInClass = enrollments
      .filter((e) => e.classId === classId)
      .map((e) => e.studentId);

    const [records, grades] = await Promise.all([
      prisma.attendanceRecord.findMany({
        where: { classId, studentId: { in: cohortInClass } },
        select: { status: true },
      }),
      prisma.grade.findMany({
        where: { classId, studentId: { in: cohortInClass } },
        select: { score: true, maxScore: true },
      }),
    ]);

    const attendance = summarizeAttendance(records);
    const averageGrade =
      grades.length === 0
        ? 0
        : Math.round(
            (grades.reduce((s, g) => s + (g.score / g.maxScore) * 100, 0) / grades.length) * 10,
          ) / 10;

    modules.push({
      classId,
      className: cls.name,
      subject: cls.subject,
      averageGrade,
      attendanceRate: attendance.rate,
      studentCount: cohortInClass.length,
    });
  }

  modules.sort((a, b) => a.subject.localeCompare(b.subject));

  const atRisk: CohortAtRiskStudent[] = [];

  for (const student of students) {
    const studentClassIds = enrollments
      .filter((e) => e.studentId === student.id)
      .map((e) => e.classId);

    if (studentClassIds.length === 0) continue;

    const records = await prisma.attendanceRecord.findMany({
      where: { studentId: student.id, classId: { in: studentClassIds } },
      select: { status: true },
    });

    if (records.length === 0) continue;

    const rate = summarizeAttendance(records).rate;
    if (rate < ATTENDANCE_RISK_THRESHOLD) {
      atRisk.push({
        id: student.id,
        name: student.name,
        studentNumber: student.studentNumber ?? student.name,
        attendanceRate: rate,
        department: student.department,
        yearOfStudy: student.yearOfStudy,
      });
    }
  }

  atRisk.sort((a, b) => a.attendanceRate - b.attendanceRate);

  return { modules, atRisk };
}
