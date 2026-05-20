import { NextResponse } from "next/server";
import type { AttendanceStatus } from "@prisma/client";
import { requireSessionApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const validStatuses: AttendanceStatus[] = ["PRESENT", "ABSENT", "LATE", "EXCUSED"];

function parseAttendanceDate(dateInput: string): Date | null {
  if (!dateInput) return null;
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(12, 0, 0, 0);
  return date;
}

async function assertTeacherClass(classId: string, teacherId: string) {
  return prisma.class.findFirst({
    where: { id: classId, teacherId },
  });
}

export async function GET(request: Request) {
  const session = await requireSessionApi(["TEACHER", "LECTURER"]);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const classId = searchParams.get("classId") ?? "";
  const dateInput = searchParams.get("date") ?? "";

  const date = parseAttendanceDate(dateInput);
  if (!classId || !date) {
    return NextResponse.json({ error: "classId and date are required" }, { status: 400 });
  }

  const cls = await assertTeacherClass(classId, session.id);
  if (!cls) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  const records = await prisma.attendanceRecord.findMany({
    where: { classId, date },
    select: { studentId: true, status: true },
  });

  return NextResponse.json({
    records: records.map((r) => ({ studentId: r.studentId, status: r.status })),
  });
}

export async function POST(request: Request) {
  const session = await requireSessionApi(["TEACHER", "LECTURER"]);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const classId = String(body.classId ?? "");
  const dateInput = String(body.date ?? "");
  const date = parseAttendanceDate(dateInput);

  if (!classId || !date) {
    return NextResponse.json({ error: "classId and date are required" }, { status: 400 });
  }

  const cls = await assertTeacherClass(classId, session.id);
  if (!cls) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  const enrolled = await prisma.enrollment.findMany({
    where: { classId },
    select: { studentId: true },
  });
  const enrolledIds = new Set(enrolled.map((e) => e.studentId));

  if (Array.isArray(body.records)) {
    const records = body.records as { studentId?: string; status?: string }[];
    if (records.length === 0) {
      return NextResponse.json({ error: "No attendance records provided" }, { status: 400 });
    }

    for (const row of records) {
      const studentId = String(row.studentId ?? "");
      const status = String(row.status ?? "") as AttendanceStatus;
      if (!studentId || !validStatuses.includes(status)) {
        return NextResponse.json({ error: "Invalid attendance data in batch" }, { status: 400 });
      }
      if (!enrolledIds.has(studentId)) {
        return NextResponse.json(
          { error: "Student is not enrolled in this class" },
          { status: 400 },
        );
      }
    }

    await prisma.$transaction(
      records.map((row) =>
        prisma.attendanceRecord.upsert({
          where: {
            studentId_classId_date: {
              studentId: String(row.studentId),
              classId,
              date,
            },
          },
          create: {
            studentId: String(row.studentId),
            classId,
            date,
            status: row.status as AttendanceStatus,
          },
          update: { status: row.status as AttendanceStatus },
        }),
      ),
    );

    return NextResponse.json({ ok: true, saved: records.length });
  }

  const studentId = String(body.studentId ?? "");
  const status = String(body.status ?? "") as AttendanceStatus;

  if (!studentId || !validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid attendance data" }, { status: 400 });
  }

  if (!enrolledIds.has(studentId)) {
    return NextResponse.json({ error: "Student is not enrolled in this class" }, { status: 400 });
  }

  await prisma.attendanceRecord.upsert({
    where: {
      studentId_classId_date: { studentId, classId, date },
    },
    create: { studentId, classId, date, status },
    update: { status },
  });

  return NextResponse.json({ ok: true });
}
