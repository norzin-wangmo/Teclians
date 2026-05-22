import type { AttendanceStatus } from "@prisma/client";
import { summarizeAttendance } from "@/lib/analytics";
import { prisma } from "@/lib/prisma";

export type MissedSession = {
  date: string;
  status: AttendanceStatus;
};

export type StudentClassSummary = {
  classId: string;
  className: string;
  subject: string;
  totalSessions: number;
  attendedSessions: number;
  attendanceRate: number;
  missedSessions: MissedSession[];
  lateSessions: number;
  averageGrade: number | null;
  assessmentCount: number;
};

function averageGradePercent(
  grades: { score: number; maxScore: number }[],
): number | null {
  if (grades.length === 0) return null;
  const avg =
    grades.reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0) / grades.length;
  return Math.round(avg * 10) / 10;
}

export async function getStudentEnrollmentSummaries(
  studentId: string,
): Promise<StudentClassSummary[]> {
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId },
    include: {
      class: { select: { id: true, name: true, subject: true } },
    },
    orderBy: { class: { name: "asc" } },
  });

  const summaries = await Promise.all(
    enrollments.map(async (enrollment) => {
      const classId = enrollment.class.id;

      const [records, grades] = await Promise.all([
        prisma.attendanceRecord.findMany({
          where: { studentId, classId },
          select: { status: true, date: true },
          orderBy: { date: "desc" },
        }),
        prisma.grade.findMany({
          where: { studentId, classId },
          select: { score: true, maxScore: true },
        }),
      ]);

      const attendance = summarizeAttendance(records);
      const attendedSessions = records.filter((r) => r.status !== "ABSENT").length;
      const lateSessions = records.filter((r) => r.status === "LATE").length;
      const missedSessions: MissedSession[] = records
        .filter((r) => r.status === "ABSENT")
        .map((r) => ({
          date: r.date.toISOString(),
          status: r.status,
        }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return {
        classId,
        className: enrollment.class.name,
        subject: enrollment.class.subject,
        totalSessions: records.length,
        attendedSessions,
        attendanceRate: attendance.rate,
        missedSessions,
        lateSessions,
        averageGrade: averageGradePercent(grades),
        assessmentCount: grades.length,
      };
    }),
  );

  return summaries.sort((a, b) => a.subject.localeCompare(b.subject));
}

export type AttendanceSessionRecord = {
  id: string;
  date: string;
  status: AttendanceStatus;
};

export type StudentModuleAttendance = {
  classId: string;
  className: string;
  subject: string;
  totalSessions: number;
  attendedSessions: number;
  attendanceRate: number;
  sessions: AttendanceSessionRecord[];
};

export async function getStudentAttendanceByModule(
  studentId: string,
): Promise<StudentModuleAttendance[]> {
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId },
    include: {
      class: { select: { id: true, name: true, subject: true } },
    },
    orderBy: { class: { name: "asc" } },
  });

  const modules = await Promise.all(
    enrollments.map(async (enrollment) => {
      const classId = enrollment.class.id;
      const records = await prisma.attendanceRecord.findMany({
        where: { studentId, classId },
        select: { id: true, status: true, date: true },
        orderBy: { date: "desc" },
      });

      const attendance = summarizeAttendance(records);
      const attendedSessions = records.filter((r) => r.status !== "ABSENT").length;

      return {
        classId,
        className: enrollment.class.name,
        subject: enrollment.class.subject,
        totalSessions: records.length,
        attendedSessions,
        attendanceRate: attendance.rate,
        sessions: records.map((r) => ({
          id: r.id,
          date: r.date.toISOString(),
          status: r.status,
        })),
      };
    }),
  );

  return modules.sort((a, b) => a.subject.localeCompare(b.subject));
}
