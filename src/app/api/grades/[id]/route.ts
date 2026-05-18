import { NextResponse } from "next/server";
import { requireSessionApi } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  const session = await requireSessionApi(["TEACHER", "LECTURER"]);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const grade = await prisma.grade.findUnique({
    where: { id },
    include: { class: { select: { teacherId: true } } },
  });

  if (!grade || grade.class.teacherId !== session.id) {
    return NextResponse.json({ error: "Grade not found" }, { status: 404 });
  }

  const body = await request.json();
  const title = body.title !== undefined ? String(body.title).trim() : undefined;
  const score = body.score !== undefined ? Number(body.score) : undefined;
  const maxScore = body.maxScore !== undefined ? Number(body.maxScore) : grade.maxScore;

  if (score !== undefined && (Number.isNaN(score) || score < 0 || score > maxScore)) {
    return NextResponse.json({ error: "Invalid score" }, { status: 400 });
  }

  const updated = await prisma.grade.update({
    where: { id },
    data: {
      ...(title ? { title } : {}),
      ...(score !== undefined ? { score } : {}),
      ...(body.maxScore !== undefined ? { maxScore } : {}),
    },
  });

  return NextResponse.json({ id: updated.id });
}
