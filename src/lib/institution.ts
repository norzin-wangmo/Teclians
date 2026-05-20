import { prisma } from "@/lib/prisma";

export type InstitutionBranding = {
  level: "COLLEGE" | "SCHOOL";
  schoolName: string;
  collegeCode: string | null;
  university: string | null;
};

export async function getInstitutionBranding(
  schoolId: string | null,
): Promise<InstitutionBranding | null> {
  if (!schoolId) return null;
  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    select: {
      name: true,
      institutionLevel: true,
      collegeCode: true,
      university: true,
    },
  });
  if (!school) return null;
  return {
    level: school.institutionLevel,
    schoolName: school.name,
    collegeCode: school.collegeCode,
    university: school.university,
  };
}

export function institutionLogoSrc(level: "COLLEGE" | "SCHOOL") {
  return level === "COLLEGE" ? "/logos/rub.svg" : "/logos/school.svg";
}
