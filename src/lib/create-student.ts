import { hashPassword } from "@/lib/auth";
import {
  buildStudentEmail,
  validateStudentNumber,
} from "@/lib/account-naming";
import { validateStudentEmail } from "@/lib/email-policy";
import { prisma } from "@/lib/prisma";

export type CreateStudentInput = {
  schoolId: string;
  studentNumber: string;
  displayName?: string;
  department?: string;
  yearOfStudy?: string;
  password?: string;
  classIds?: string[];
};

export type CreateStudentResult =
  | { ok: true; id: string; studentNumber: string; email: string }
  | { ok: false; error: string; status: number };

export async function createStudentAccount(
  input: CreateStudentInput,
): Promise<CreateStudentResult> {
  const studentNumber = input.studentNumber.trim();
  const displayName = input.displayName?.trim();
  const department = input.department?.trim() || undefined;
  const yearOfStudy = input.yearOfStudy?.trim() || undefined;
  const password = input.password?.trim() || "password123";
  const classIds = input.classIds ?? [];

  const idError = validateStudentNumber(studentNumber);
  if (idError) {
    return { ok: false, error: idError, status: 400 };
  }

  if (password.length < 6) {
    return { ok: false, error: "Password must be at least 6 characters", status: 400 };
  }

  const school = await prisma.school.findUnique({ where: { id: input.schoolId } });
  if (!school) {
    return { ok: false, error: "Institution not found", status: 404 };
  }

  const existingId = await prisma.user.findFirst({
    where: { schoolId: school.id, studentNumber },
  });
  if (existingId) {
    return {
      ok: false,
      error: "This student ID is already registered at this institution",
      status: 409,
    };
  }

  const email = buildStudentEmail(studentNumber, {
    emailDomain: school.emailDomain,
    institutionLevel: school.institutionLevel,
  });
  const emailError = validateStudentEmail(email);
  if (emailError) {
    return { ok: false, error: emailError, status: 400 };
  }

  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) {
    return { ok: false, error: "An account with this email already exists", status: 409 };
  }

  const schoolClasses = await prisma.class.findMany({
    where: { schoolId: school.id },
    select: { id: true },
  });
  const allowed = new Set(schoolClasses.map((c) => c.id));
  for (const classId of classIds) {
    if (!allowed.has(classId)) {
      return { ok: false, error: "One or more selected classes are invalid", status: 400 };
    }
  }

  const passwordHash = await hashPassword(password);
  const student = await prisma.user.create({
    data: {
      name: displayName || studentNumber,
      studentNumber,
      email,
      department,
      yearOfStudy,
      passwordHash,
      role: "STUDENT",
      schoolId: school.id,
    },
  });

  for (const classId of classIds) {
    await prisma.enrollment.upsert({
      where: { studentId_classId: { studentId: student.id, classId } },
      create: { studentId: student.id, classId },
      update: {},
    });
  }

  return {
    ok: true,
    id: student.id,
    studentNumber: student.studentNumber!,
    email: student.email,
  };
}
