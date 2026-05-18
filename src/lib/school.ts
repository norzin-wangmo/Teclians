import { prisma } from "@/lib/prisma";

export async function getSchoolSettings(schoolId: string | null) {
  if (!schoolId) return null;
  return prisma.school.findUnique({
    where: { id: schoolId },
    select: { emailDomain: true, institutionLevel: true, name: true, university: true },
  });
}

/** College / school unit under a parent university (e.g. CST under RUB). */
export function formatInstitution(school: {
  name: string;
  university?: string | null;
  district?: string;
}) {
  const college = school.name;
  const university = school.university?.trim() || null;
  const full = university ? `${college} · ${university}` : college;
  return { college, university, full };
}
