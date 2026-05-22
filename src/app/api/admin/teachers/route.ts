import { NextResponse } from "next/server";
import type { Role } from "@prisma/client";
import { hashPassword, requireSessionApi } from "@/lib/auth";
import {
  formatStaffNameFromEmail,
  validateStaffNameMatchesEmail,
} from "@/lib/account-naming";
import { validateStaffEmail } from "@/lib/email-policy";
import { prisma } from "@/lib/prisma";
import { syncTeacherModules } from "@/lib/sync-teacher-classes";

const ALLOWED_CREATE_ROLES: Role[] = ["TEACHER", "LECTURER"];

export async function POST(request: Request) {
  const session = await requireSessionApi(["ADMIN"]);
  if (!session?.schoolId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const email = String(body.email ?? "").trim().toLowerCase();
  let name = String(body.name ?? "").trim();
  const password = String(body.password ?? "password123");
  const roleInput = String(body.role ?? "TEACHER").toUpperCase();
  const modules = Array.isArray(body.modules)
    ? body.modules.map((m: unknown) => String(m).trim()).filter(Boolean)
    : [];

  if (!email) {
    return NextResponse.json({ error: "Education email is required" }, { status: 400 });
  }

  if (!ALLOWED_CREATE_ROLES.includes(roleInput as Role)) {
    return NextResponse.json(
      { error: "Only teacher or lecturer accounts can be created here" },
      { status: 400 },
    );
  }

  const emailError = validateStaffEmail(email);
  if (emailError) {
    return NextResponse.json({ error: emailError }, { status: 400 });
  }

  if (!name) {
    name = formatStaffNameFromEmail(email);
  }

  const nameError = validateStaffNameMatchesEmail(name, email);
  if (nameError) {
    return NextResponse.json({ error: nameError }, { status: 400 });
  }

  if (modules.length === 0) {
    return NextResponse.json(
      { error: "Select at least one module they will teach" },
      { status: 400 },
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }

  const staff = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password),
      role: roleInput as "TEACHER" | "LECTURER",
      schoolId: session.schoolId,
    },
  });

  await syncTeacherModules(session.schoolId, staff.id, name, modules);

  return NextResponse.json({
    id: staff.id,
    name: staff.name,
    email: staff.email,
    role: staff.role,
  });
}
