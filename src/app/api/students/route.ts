import { NextResponse } from "next/server";
import { hashPassword, requireSessionApi } from "@/lib/auth";
import {
  buildStudentEmail,
  validateStudentNumber,
} from "@/lib/account-naming";
import { validateStudentEmail } from "@/lib/email-policy";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await requireSessionApi(["ADMIN"]);
  if (!session) {
    return NextResponse.json(
      {
        error:
          "Only school administrators can create student login accounts. Teachers and lecturers are added under Staff accounts.",
      },
      { status: 403 },
    );
  }

  const body = await request.json();
  const studentNumber = String(body.studentNumber ?? "").trim();
  const displayName = String(body.displayName ?? body.fullName ?? "").trim();
  const department = String(body.department ?? "").trim() || undefined;
  const yearOfStudy = String(body.yearOfStudy ?? "").trim() || undefined;
  const password = String(body.password ?? "password123");
  const classIds = Array.isArray(body.classIds) ? (body.classIds as string[]) : [];

  const idError = validateStudentNumber(studentNumber);
  if (idError) {
    return NextResponse.json({ error: idError }, { status: 400 });
  }

  const schoolId = session.schoolId;
  if (!schoolId) {
    return NextResponse.json({ error: "No school linked to your account" }, { status: 400 });
  }

  const school = await prisma.school.findUnique({ where: { id: schoolId } });
  if (!school) {
    return NextResponse.json({ error: "School not found" }, { status: 404 });
  }

  const existingId = await prisma.user.findFirst({
    where: { schoolId, studentNumber },
  });
  if (existingId) {
    return NextResponse.json({ error: "Student ID already exists in this school" }, { status: 409 });
  }

  const email = buildStudentEmail(studentNumber, {
    emailDomain: school.emailDomain,
    institutionLevel: school.institutionLevel,
  });
  const emailError = validateStudentEmail(email);
  if (emailError) {
    return NextResponse.json({ error: emailError }, { status: 400 });
  }

  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) {
    return NextResponse.json({ error: "Generated email already in use" }, { status: 409 });
  }

  const schoolClasses = await prisma.class.findMany({
    where: { schoolId },
    select: { id: true },
  });
  const allowed = new Set(schoolClasses.map((c) => c.id));
  for (const classId of classIds) {
    if (!allowed.has(classId)) {
      return NextResponse.json({ error: "Class not in your school" }, { status: 400 });
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
      schoolId,
    },
  });

  for (const classId of classIds) {
    await prisma.enrollment.upsert({
      where: { studentId_classId: { studentId: student.id, classId } },
      create: { studentId: student.id, classId },
      update: {},
    });
  }

  return NextResponse.json({
    id: student.id,
    studentNumber: student.studentNumber,
    email: student.email,
  });
}
