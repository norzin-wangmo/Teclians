import { NextResponse } from "next/server";
import type { Role } from "@prisma/client";
import { hashPassword, requireSessionApi } from "@/lib/auth";
import {
  formatStaffNameFromEmail,
  validateStaffNameMatchesEmail,
} from "@/lib/account-naming";
import { validateStaffEmail } from "@/lib/email-policy";
import { prisma } from "@/lib/prisma";

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

  if (!email) {
    return NextResponse.json({ error: "Education email is required" }, { status: 400 });
  }

  if (!ALLOWED_CREATE_ROLES.includes(roleInput as Role)) {
    return NextResponse.json(
      { error: "Only Teacher or Lecturer accounts can be created here" },
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

  return NextResponse.json({
    id: staff.id,
    name: staff.name,
    email: staff.email,
    role: staff.role,
  });
}
