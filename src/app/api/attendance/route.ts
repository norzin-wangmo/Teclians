import { NextResponse } from "next/server";
import type { AttendanceStatus } from "@prisma/client";
import { requireSessionApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const validStatuses: AttendanceStatus[] = ["PRESENT", "ABSENT", "LATE", "EXCUSED"];

export async function POST(request: Request) {
  const session = await requireSessionApi(["TEACHER", "LECTURER"]);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();

  const classId = String(body.classId ?? "");
  const studentId = String(body.studentId ?? "");
  const status = String(body.status ?? "") as AttendanceStatus;
  const dateInput = String(body.date ?? "");

  if (!classId || !studentId || !dateInput || !validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid attendance data" }, { status: 400 });
  }

  const cls = await prisma.class.findFirst({
    where: { id: classId, teacherId: session.id },
  });

  if (!cls) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_classId: { studentId, classId } },
  });

  if (!enrollment) {
    return NextResponse.json({ error: "Student is not enrolled in this class" }, { status: 400 });
  }

  const date = new Date(dateInput);
  date.setHours(12, 0, 0, 0);

  await prisma.attendanceRecord.upsert({
    where: {
      studentId_classId_date: { studentId, classId, date },
    },
    create: { studentId, classId, date, status },
    update: { status },
  });

  return NextResponse.json({ ok: true });
}
