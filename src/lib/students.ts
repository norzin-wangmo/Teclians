import type { SessionUser } from "@/lib/types";
import { isTeachingStaff } from "@/lib/roles";
import { prisma } from "@/lib/prisma";

export type StudentRecord = {
  id: string;
  studentNumber: string;
  name: string;
  email: string;
  department: string | null;
  yearOfStudy: string | null;
  classIds: string[];
  classNames: string[];
};

function toStudentRecord(
  student: {
    id: string;
    name: string;
    email: string;
    studentNumber: string | null;
    department?: string | null;
    yearOfStudy?: string | null;
  },
  classIds: string[],
  classNames: string[],
): StudentRecord {
  const studentNumber = student.studentNumber ?? student.name;
  return {
    id: student.id,
    studentNumber,
    name: student.name,
    email: student.email,
    department: student.department ?? null,
    yearOfStudy: student.yearOfStudy ?? null,
    classIds,
    classNames,
  };
}

export async function canManageStudent(session: SessionUser, studentId: string) {
  const student = await prisma.user.findFirst({
    where: { id: studentId, role: "STUDENT" },
  });
  if (!student || student.schoolId !== session.schoolId) return null;

  if (session.role === "ADMIN") return student;

  if (!isTeachingStaff(session.role)) return null;

  const inTeacherClass = await prisma.enrollment.findFirst({
    where: {
      studentId,
      class: { teacherId: session.id },
    },
  });
  return inTeacherClass ? student : null;
}

export async function getTeacherStudents(teacherId: string): Promise<StudentRecord[]> {
  const classes = await prisma.class.findMany({
    where: { teacherId },
    select: { id: true, name: true },
  });
  const classIds = classes.map((c) => c.id);
  const classNameById = new Map(classes.map((c) => [c.id, c.name]));

  if (classIds.length === 0) return [];

  const enrollments = await prisma.enrollment.findMany({
    where: { classId: { in: classIds } },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          email: true,
          studentNumber: true,
          department: true,
          yearOfStudy: true,
        },
      },
    },
  });

  const map = new Map<string, StudentRecord>();

  for (const e of enrollments) {
    const existing = map.get(e.studentId) ?? toStudentRecord(e.student, [], []);
    if (!existing.classIds.includes(e.classId)) {
      existing.classIds.push(e.classId);
      const className = classNameById.get(e.classId);
      if (className) existing.classNames.push(className);
    }
    map.set(e.studentId, existing);
  }

  return [...map.values()].sort((a, b) => a.studentNumber.localeCompare(b.studentNumber));
}

export async function getSchoolStudents(schoolId: string): Promise<StudentRecord[]> {
  const students = await prisma.user.findMany({
    where: { schoolId, role: "STUDENT" },
    select: {
      id: true,
      name: true,
      email: true,
      studentNumber: true,
      department: true,
      yearOfStudy: true,
      enrollments: {
        include: { class: { select: { id: true, name: true } } },
      },
    },
    orderBy: { studentNumber: "asc" },
  });

  return students.map((s) =>
    toStudentRecord(
      s,
      s.enrollments.map((e) => e.class.id),
      s.enrollments.map((e) => e.class.name),
    ),
  );
}
