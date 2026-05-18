import { NextResponse } from "next/server";
import { hashPassword, requireSessionApi } from "@/lib/auth";
import {
  buildStudentEmail,
  validateStudentNumber,
} from "@/lib/account-naming";
import { validateStudentEmail } from "@/lib/email-policy";
import { canManageStudent } from "@/lib/students";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  const session = await requireSessionApi(["TEACHER", "LECTURER", "ADMIN"]);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const student = await canManageStudent(session, id);
  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  const body = await request.json();
  const studentNumberInput =
    body.studentNumber !== undefined ? String(body.studentNumber).trim() : undefined;
  const displayNameInput =
    body.displayName !== undefined
      ? String(body.displayName).trim()
      : body.fullName !== undefined
        ? String(body.fullName).trim()
        : undefined;
  const password = body.password ? String(body.password) : undefined;
  const classIds = Array.isArray(body.classIds) ? (body.classIds as string[]) : undefined;
  const departmentInput =
    body.department !== undefined ? String(body.department).trim() : undefined;
  const yearOfStudyInput =
    body.yearOfStudy !== undefined ? String(body.yearOfStudy).trim() : undefined;

  let studentNumber = student.studentNumber;
  let email = student.email;
  let name = student.name;

  if (studentNumberInput !== undefined && session.role === "ADMIN") {
    const idError = validateStudentNumber(studentNumberInput);
    if (idError) {
      return NextResponse.json({ error: idError }, { status: 400 });
    }

    const duplicate = await prisma.user.findFirst({
      where: {
        schoolId: session.schoolId!,
        studentNumber: studentNumberInput,
        NOT: { id },
      },
    });
    if (duplicate) {
      return NextResponse.json({ error: "Student ID already in use" }, { status: 409 });
    }

    const school = await prisma.school.findUnique({
      where: { id: session.schoolId! },
    });
    if (!school) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    studentNumber = studentNumberInput;
    email = buildStudentEmail(studentNumberInput, {
      emailDomain: school.emailDomain,
      institutionLevel: school.institutionLevel,
    });

    const emailError = validateStudentEmail(email);
    if (emailError) {
      return NextResponse.json({ error: emailError }, { status: 400 });
    }

    if (email !== student.email) {
      const taken = await prisma.user.findUnique({ where: { email } });
      if (taken) {
        return NextResponse.json({ error: "Email already in use" }, { status: 409 });
      }
    }
  }

  if (displayNameInput !== undefined) {
    name = displayNameInput || studentNumber || student.name;
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(studentNumberInput !== undefined && session.role === "ADMIN"
        ? { studentNumber, email }
        : {}),
      ...(displayNameInput !== undefined ? { name } : {}),
      ...(departmentInput !== undefined && session.role === "ADMIN"
        ? { department: departmentInput || null }
        : {}),
      ...(yearOfStudyInput !== undefined && session.role === "ADMIN"
        ? { yearOfStudy: yearOfStudyInput || null }
        : {}),
      ...(password ? { passwordHash: await hashPassword(password) } : {}),
    },
  });

  if (classIds !== undefined) {
    if (session.role === "TEACHER" || session.role === "LECTURER") {
      const teacherClassIds = (
        await prisma.class.findMany({
          where: { teacherId: session.id },
          select: { id: true },
        })
      ).map((c) => c.id);

      await prisma.enrollment.deleteMany({
        where: { studentId: id, classId: { in: teacherClassIds } },
      });

      const allowed = classIds.filter((cid) => teacherClassIds.includes(cid));
      for (const classId of allowed) {
        await prisma.enrollment.upsert({
          where: { studentId_classId: { studentId: id, classId } },
          create: { studentId: id, classId },
          update: {},
        });
      }
    } else {
      await prisma.enrollment.deleteMany({ where: { studentId: id } });
      for (const classId of classIds) {
        const inSchool = await prisma.class.findFirst({
          where: { id: classId, schoolId: session.schoolId! },
        });
        if (!inSchool) continue;
        await prisma.enrollment.upsert({
          where: { studentId_classId: { studentId: id, classId } },
          create: { studentId: id, classId },
          update: {},
        });
      }
    }
  }

  return NextResponse.json({
    id: updated.id,
    studentNumber: updated.studentNumber,
    email: updated.email,
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await requireSessionApi(["TEACHER", "LECTURER", "ADMIN"]);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const student = await canManageStudent(session, id);
  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  await prisma.user.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
