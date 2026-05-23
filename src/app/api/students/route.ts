import { NextResponse } from "next/server";
import { createStudentAccount } from "@/lib/create-student";
import { requireSessionApi } from "@/lib/auth";
import { isTeachingStaff } from "@/lib/roles";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await requireSessionApi(["ADMIN", "TEACHER", "LECTURER"]);
  if (!session) {
    return NextResponse.json(
      {
        error:
          "Only school administrators and teaching staff can create student login accounts.",
      },
      { status: 403 },
    );
  }

  if (!session.schoolId) {
    return NextResponse.json({ error: "No school linked to your account" }, { status: 400 });
  }

  const body = await request.json();
  const classIds = Array.isArray(body.classIds) ? (body.classIds as string[]) : [];

  if (isTeachingStaff(session.role) && classIds.length === 0) {
    return NextResponse.json(
      { error: "Select at least one of your classes when adding a student" },
      { status: 400 },
    );
  }

  if (isTeachingStaff(session.role)) {
    const teacherClasses = await prisma.class.findMany({
      where: { teacherId: session.id },
      select: { id: true },
    });
    const allowed = new Set(teacherClasses.map((c) => c.id));
    for (const classId of classIds) {
      if (!allowed.has(classId)) {
        return NextResponse.json(
          { error: "You can only enroll students in classes you teach" },
          { status: 403 },
        );
      }
    }
  }

  const result = await createStudentAccount({
    schoolId: session.schoolId,
    studentNumber: String(body.studentNumber ?? ""),
    displayName: String(body.displayName ?? body.fullName ?? ""),
    department: String(body.department ?? ""),
    yearOfStudy: String(body.yearOfStudy ?? ""),
    password: String(body.password ?? "password123"),
    classIds,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    id: result.id,
    studentNumber: result.studentNumber,
    email: result.email,
  });
}
