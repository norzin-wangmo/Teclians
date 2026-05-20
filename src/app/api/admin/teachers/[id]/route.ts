import { NextResponse } from "next/server";
import type { Role } from "@prisma/client";
import { hashPassword, requireSessionApi } from "@/lib/auth";
import {
  formatStaffNameFromEmail,
  validateStaffNameMatchesEmail,
} from "@/lib/account-naming";
import { validateStaffEmail } from "@/lib/email-policy";
import { STAFF_TEACHING_ROLES } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import { syncTeacherModules } from "@/lib/sync-teacher-classes";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  const session = await requireSessionApi(["ADMIN"]);
  if (!session?.schoolId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const staff = await prisma.user.findFirst({
    where: {
      id,
      schoolId: session.schoolId,
      role: { in: STAFF_TEACHING_ROLES },
    },
  });

  if (!staff) {
    return NextResponse.json({ error: "Teacher or lecturer not found" }, { status: 404 });
  }

  const body = await request.json();
  let name = body.name !== undefined ? String(body.name).trim() : undefined;
  const email = body.email !== undefined ? String(body.email).trim().toLowerCase() : undefined;
  const password = body.password ? String(body.password) : undefined;
  const roleInput = body.role !== undefined ? String(body.role).toUpperCase() : undefined;
  const modules =
    body.modules !== undefined
      ? Array.isArray(body.modules)
        ? body.modules.map((m: unknown) => String(m).trim()).filter(Boolean)
        : []
      : undefined;

  if (roleInput && !STAFF_TEACHING_ROLES.includes(roleInput as Role)) {
    return NextResponse.json(
      { error: "Role must be Teacher or Lecturer" },
      { status: 400 },
    );
  }

  const nextEmail = email ?? staff.email;

  if (email) {
    const emailError = validateStaffEmail(email);
    if (emailError) {
      return NextResponse.json({ error: emailError }, { status: 400 });
    }
    if (email !== staff.email) {
      const taken = await prisma.user.findUnique({ where: { email } });
      if (taken) {
        return NextResponse.json({ error: "Email already in use" }, { status: 409 });
      }
    }
  }

  if (!name && email) {
    name = formatStaffNameFromEmail(nextEmail);
  }

  if (name) {
    const nameError = validateStaffNameMatchesEmail(name, nextEmail);
    if (nameError) {
      return NextResponse.json({ error: nameError }, { status: 400 });
    }
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(name ? { name } : {}),
      ...(email ? { email } : {}),
      ...(password ? { passwordHash: await hashPassword(password) } : {}),
      ...(roleInput ? { role: roleInput as "TEACHER" | "LECTURER" } : {}),
    },
  });

  if (modules !== undefined) {
    if (modules.length === 0) {
      return NextResponse.json(
        { error: "Select at least one module the teacher will teach" },
        { status: 400 },
      );
    }
    await syncTeacherModules(
      session.schoolId,
      updated.id,
      updated.name,
      modules,
    );
  }

  return NextResponse.json({
    id: updated.id,
    name: updated.name,
    email: updated.email,
    role: updated.role,
  });
}
