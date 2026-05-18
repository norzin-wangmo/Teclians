import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { SessionUser } from "@/lib/types";
import { validateLoginEmail } from "@/lib/email-policy";
import { isEmailLoginIdentifier } from "@/lib/account-naming";

const COOKIE_NAME = "teclians_session";

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    schoolId: user.schoolId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as Role,
      schoolId: (payload.schoolId as string | null) ?? null,
    };
  } catch {
    return null;
  }
}

/** JWT session reconciled with the database (handles reseed / deleted schools). */
export async function resolveSession(): Promise<SessionUser | null> {
  const session = await getSession();
  if (!session) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: session.id },
    select: { id: true, email: true, name: true, role: true, schoolId: true },
  });

  if (!dbUser) return null;

  let schoolId = dbUser.schoolId;
  if (schoolId) {
    const schoolExists = await prisma.school.findUnique({
      where: { id: schoolId },
      select: { id: true },
    });
    if (!schoolExists) schoolId = null;
  }

  return {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    role: dbUser.role,
    schoolId,
  };
}

export async function requireSession(allowedRoles?: Role[]): Promise<SessionUser> {
  const jwtSession = await getSession();
  const session = await resolveSession();
  if (!session) {
    if (jwtSession) redirect("/api/auth/logout");
    redirect("/login");
  }
  if (allowedRoles && !allowedRoles.includes(session.role)) {
    redirect(dashboardPath(session.role));
  }
  return session;
}

export async function requireSessionApi(
  allowedRoles?: Role[],
): Promise<SessionUser | null> {
  const session = await resolveSession();
  if (!session) return null;
  if (allowedRoles && !allowedRoles.includes(session.role)) return null;
  return session;
}

export function dashboardPath(role: Role): string {
  switch (role) {
    case "TEACHER":
    case "LECTURER":
      return "/dashboard/teacher";
    case "STUDENT":
      return "/dashboard/student";
    case "ADMIN":
      return "/dashboard/admin";
    case "AUTHORITY":
      return "/dashboard/authority";
    default:
      return "/login";
  }
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyCredentials(identifier: string, password: string) {
  const input = identifier.trim();
  if (!input) return null;

  let user = null;

  if (isEmailLoginIdentifier(input)) {
    const normalized = input.toLowerCase();
    const emailError = validateLoginEmail(normalized);
    if (emailError) return null;
    user = await prisma.user.findUnique({ where: { email: normalized } });
    if (user?.role === "STUDENT") return null;
  } else {
    user = await prisma.user.findFirst({
      where: {
        role: "STUDENT",
        studentNumber: input,
      },
    });
  }

  if (!user) return null;

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;

  const displayName = user.name;

  return {
    id: user.id,
    email: user.email,
    name: displayName,
    role: user.role,
    schoolId: user.schoolId,
  } satisfies SessionUser;
}
