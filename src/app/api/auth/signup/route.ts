import { NextResponse } from "next/server";
import { createStudentAccount } from "@/lib/create-student";
import { createSession, dashboardPath } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    if (!process.env.AUTH_SECRET?.trim()) {
      return NextResponse.json(
        {
          error:
            "Server is not configured. Run npm run setup on this machine.",
        },
        { status: 503 },
      );
    }

    const body = await request.json();
    const schoolId = String(body.schoolId ?? "").trim();
    const studentNumber = String(body.studentNumber ?? "").trim();
    const displayName = String(body.displayName ?? "").trim();
    const department = String(body.department ?? "").trim();
    const yearOfStudy = String(body.yearOfStudy ?? "").trim();
    const password = String(body.password ?? "");
    const confirmPassword = String(body.confirmPassword ?? body.passwordConfirm ?? "");

    if (!schoolId || !studentNumber || !displayName) {
      return NextResponse.json(
        { error: "Institution, student ID, and full name are required" },
        { status: 400 },
      );
    }

    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }

    const result = await createStudentAccount({
      schoolId,
      studentNumber,
      displayName,
      department: department || undefined,
      yearOfStudy: yearOfStudy || undefined,
      password,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const user = await prisma.user.findUnique({
      where: { id: result.id },
      select: { id: true, email: true, name: true, role: true, schoolId: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Account created but sign-in failed" }, { status: 500 });
    }

    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      schoolId: user.schoolId,
    });

    return NextResponse.json({ redirect: dashboardPath(user.role) });
  } catch (error) {
    console.error("[signup]", error);
    return NextResponse.json(
      { error: "Sign-up failed due to a server error. Try again or contact your administrator." },
      { status: 500 },
    );
  }
}
