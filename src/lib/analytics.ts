import type { AttendanceStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  AttendanceSummary,
  ClassAnalytics,
  GradeSummary,
  SchoolAnalytics,
  SubjectPerformance,
} from "@/lib/types";

function attendanceRate(counts: AttendanceSummary): number {
  const total =
    counts.present + counts.absent + counts.late + counts.excused;
  if (total === 0) return 0;
  return Math.round(((counts.present + counts.late) / total) * 1000) / 10;
}

export function summarizeAttendance(
  records: { status: AttendanceStatus }[],
): AttendanceSummary {
  const summary: AttendanceSummary = {
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    rate: 0,
  };

  for (const record of records) {
    switch (record.status) {
      case "PRESENT":
        summary.present += 1;
        break;
      case "ABSENT":
        summary.absent += 1;
        break;
      case "LATE":
        summary.late += 1;
        break;
      case "EXCUSED":
        summary.excused += 1;
        break;
    }
  }

  summary.rate = attendanceRate(summary);
  return summary;
}

export function summarizeGrades(
  grades: {
    title: string;
    score: number;
    maxScore: number;
    class: { name: string };
  }[],
): GradeSummary {
  if (grades.length === 0) {
    return { averagePercent: 0, count: 0, recent: [] };
  }

  const percents = grades.map((g) => (g.score / g.maxScore) * 100);
  const averagePercent =
    Math.round(
      (percents.reduce((sum, value) => sum + value, 0) / percents.length) * 10,
    ) / 10;

  return {
    averagePercent,
    count: grades.length,
    recent: grades.slice(0, 5).map((g) => ({
      title: g.title,
      score: g.score,
      maxScore: g.maxScore,
      className: g.class.name,
    })),
  };
}

export async function getStudentAnalytics(studentId: string) {
  const [attendance, grades] = await Promise.all([
    prisma.attendanceRecord.findMany({
      where: { studentId },
      select: { status: true },
    }),
    prisma.grade.findMany({
      where: { studentId },
      include: { class: { select: { name: true } } },
      orderBy: { recordedAt: "desc" },
    }),
  ]);

  return {
    attendance: summarizeAttendance(attendance),
    grades: summarizeGrades(grades),
  };
}

export async function getTeacherClassAnalytics(teacherId: string) {
  const classes = await prisma.class.findMany({
    where: { teacherId },
    include: {
      enrollments: true,
      attendanceRecords: { select: { status: true } },
      grades: { select: { score: true, maxScore: true } },
    },
  });

  return classes.map((cls): ClassAnalytics => {
    const attendance = summarizeAttendance(cls.attendanceRecords);
    const averageGrade =
      cls.grades.length === 0
        ? 0
        : Math.round(
            (cls.grades.reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0) /
              cls.grades.length) *
              10,
          ) / 10;

    return {
      classId: cls.id,
      className: cls.name,
      subject: cls.subject,
      attendanceRate: attendance.rate,
      averageGrade,
      studentCount: cls.enrollments.length,
    };
  });
}

export async function getSchoolAnalytics(schoolId: string): Promise<SchoolAnalytics | null> {
  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    include: {
      classes: {
        include: {
          enrollments: true,
          attendanceRecords: { select: { status: true } },
          grades: { select: { score: true, maxScore: true } },
        },
      },
      users: { where: { role: "STUDENT" }, select: { id: true } },
    },
  });

  if (!school) return null;

  const allAttendance = school.classes.flatMap((c) => c.attendanceRecords);
  const allGrades = school.classes.flatMap((c) => c.grades);
  const attendance = summarizeAttendance(allAttendance);

  const averageGrade =
    allGrades.length === 0
      ? 0
      : Math.round(
          (allGrades.reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0) /
            allGrades.length) *
            10,
        ) / 10;

  return {
    schoolId: school.id,
    schoolName: school.name,
    universityName: school.university,
    institutionLevel: school.institutionLevel,
    district: school.district,
    attendanceRate: attendance.rate,
    averageGrade,
    studentCount: school.users.length,
    classCount: school.classes.length,
  };
}

export async function getSubjectWisePerformance(filter: {
  schoolId?: string;
  teacherId?: string;
}): Promise<SubjectPerformance[]> {
  const classes = await prisma.class.findMany({
    where: {
      ...(filter.schoolId ? { schoolId: filter.schoolId } : {}),
      ...(filter.teacherId ? { teacherId: filter.teacherId } : {}),
    },
    include: {
      enrollments: true,
      attendanceRecords: { select: { status: true } },
      grades: { select: { score: true, maxScore: true } },
    },
  });

  const bySubject = new Map<string, SubjectPerformance & { grades: number[] }>();

  for (const cls of classes) {
    const gradePercents = cls.grades.map((g) => (g.score / g.maxScore) * 100);

    const existing = bySubject.get(cls.subject) ?? {
      subject: cls.subject,
      attendanceRate: 0,
      averageGrade: 0,
      classCount: 0,
      enrollmentCount: 0,
      grades: [] as number[],
    };

    existing.classCount += 1;
    existing.enrollmentCount += cls.enrollments.length;
    existing.grades.push(...gradePercents);
    bySubject.set(cls.subject, existing);
  }

  return [...bySubject.values()]
    .map((entry) => {
      const attendanceRecords = classes
        .filter((c) => c.subject === entry.subject)
        .flatMap((c) => c.attendanceRecords);
      const attendance = summarizeAttendance(attendanceRecords);

      return {
        subject: entry.subject,
        attendanceRate: attendance.rate,
        averageGrade:
          entry.grades.length === 0
            ? 0
            : Math.round(
                (entry.grades.reduce((s, g) => s + g, 0) / entry.grades.length) * 10,
              ) / 10,
        classCount: entry.classCount,
        enrollmentCount: entry.enrollmentCount,
      };
    })
    .sort((a, b) => a.subject.localeCompare(b.subject));
}

export async function getAuthorityAnalytics(): Promise<SchoolAnalytics[]> {
  const schools = await prisma.school.findMany({ select: { id: true } });
  const results = await Promise.all(
    schools.map((school) => getSchoolAnalytics(school.id)),
  );
  return results.filter((item): item is SchoolAnalytics => item !== null);
}

export async function getMonthlyAttendanceTrend(
  filter: { studentId?: string; classId?: string; schoolId?: string },
  months = 6,
) {
  const start = new Date();
  start.setMonth(start.getMonth() - (months - 1));
  start.setDate(1);
  start.setHours(0, 0, 0, 0);

  const records = await prisma.attendanceRecord.findMany({
    where: {
      date: { gte: start },
      ...(filter.studentId ? { studentId: filter.studentId } : {}),
      ...(filter.classId ? { classId: filter.classId } : {}),
      ...(filter.schoolId ? { class: { schoolId: filter.schoolId } } : {}),
    },
    select: { date: true, status: true },
  });

  const buckets = new Map<string, AttendanceSummary>();

  for (const record of records) {
    const key = `${record.date.getFullYear()}-${String(record.date.getMonth() + 1).padStart(2, "0")}`;
    const bucket = buckets.get(key) ?? {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      rate: 0,
    };

    switch (record.status) {
      case "PRESENT":
        bucket.present += 1;
        break;
      case "ABSENT":
        bucket.absent += 1;
        break;
      case "LATE":
        bucket.late += 1;
        break;
      case "EXCUSED":
        bucket.excused += 1;
        break;
    }

    bucket.rate = attendanceRate(bucket);
    buckets.set(key, bucket);
  }

  const labels: string[] = [];
  const rates: number[] = [];
  const cursor = new Date(start);

  for (let i = 0; i < months; i++) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
    labels.push(
      cursor.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
    );
    rates.push(buckets.get(key)?.rate ?? 0);
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return { labels, rates };
}
