import { NextResponse } from "next/server";
import { requireSessionApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await requireSessionApi(["TEACHER", "LECTURER"]);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();

  const classId = String(body.classId ?? "");
  const studentId = String(body.studentId ?? "");
  const title = String(body.title ?? "").trim();
  const score = Number(body.score);
  const maxScore = Number(body.maxScore ?? 100);

  if (!classId || !studentId || !title || Number.isNaN(score) || score < 0 || score > maxScore) {
    return NextResponse.json({ error: "Invalid grade data" }, { status: 400 });
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

  await prisma.grade.create({
    data: { studentId, classId, title, score, maxScore },
  });

  return NextResponse.json({ ok: true });
}
