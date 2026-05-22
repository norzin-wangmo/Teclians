import type { InstitutionLevel } from "@prisma/client";

export function teachingStaffLabel(level?: InstitutionLevel | null): string {
  return level === "SCHOOL" ? "Teacher" : "Lecturer";
}

export function teachingStaffPlural(level?: InstitutionLevel | null): string {
  return level === "SCHOOL" ? "Teachers" : "Lecturers";
}
