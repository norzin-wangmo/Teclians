import type { Role } from "@prisma/client";

/** College staff use LECTURER; school (high school) staff use TEACHER. */
export const STAFF_TEACHING_ROLES: Role[] = ["TEACHER", "LECTURER"];

export function isTeachingStaff(role: Role): boolean {
  return STAFF_TEACHING_ROLES.includes(role);
}

export const STAFF_ROLE_LABELS: Record<"TEACHER" | "LECTURER", string> = {
  TEACHER: "Teacher",
  LECTURER: "Lecturer",
};

export function staffRoleLabel(role: Role): string {
  if (role === "LECTURER") return STAFF_ROLE_LABELS.LECTURER;
  if (role === "TEACHER") return STAFF_ROLE_LABELS.TEACHER;
  return role;
}
