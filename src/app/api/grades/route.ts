import { NextResponse } from "next/server";
import { requireSessionApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function assertTeacherClass(classId: string, teacherId: string) {
  return prisma.class.findFirst({
    where: { id: classId, teacherId },
  });
}

export async function POST(request: Request) {
  const session = await requireSessionApi(["TEACHER", "LECTURER"]);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const classId = String(body.classId ?? "");
  const title = String(body.title ?? "").trim();
  const maxScore = Number(body.maxScore ?? 100);

  if (!classId || !title) {
    return NextResponse.json({ error: "classId and title are required" }, { status: 400 });
  }

  if (Number.isNaN(maxScore) || maxScore <= 0) {
    return NextResponse.json({ error: "Invalid maximum score" }, { status: 400 });
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
    const records = body.records as { studentId?: string; score?: number }[];
    if (records.length === 0) {
      return NextResponse.json({ error: "No marks provided" }, { status: 400 });
    }

    for (const row of records) {
      const studentId = String(row.studentId ?? "");
      const score = Number(row.score);
      if (!studentId || Number.isNaN(score) || score < 0 || score > maxScore) {
        return NextResponse.json({ error: "Invalid mark in batch" }, { status: 400 });
      }
      if (!enrolledIds.has(studentId)) {
        return NextResponse.json(
          { error: "Student is not enrolled in this class" },
          { status: 400 },
        );
      }
    }

    await prisma.grade.createMany({
      data: records.map((row) => ({
        studentId: String(row.studentId),
        classId,
        title,
        score: Number(row.score),
        maxScore,
      })),
    });

    return NextResponse.json({ ok: true, saved: records.length });
  }

  const studentId = String(body.studentId ?? "");
  const score = Number(body.score);

  if (!studentId || Number.isNaN(score) || score < 0 || score > maxScore) {
    return NextResponse.json({ error: "Invalid grade data" }, { status: 400 });
  }

  if (!enrolledIds.has(studentId)) {
    return NextResponse.json({ error: "Student is not enrolled in this class" }, { status: 400 });
  }

  await prisma.grade.create({
    data: { studentId, classId, title, score, maxScore },
  });

  return NextResponse.json({ ok: true });
}
