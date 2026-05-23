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

const INSTITUTION_LOGOS = {
  cst: "/logos/cst.png",
  motithang: "/logos/motithang.png",
  rubCollege: "/logos/rub.svg",
  school: "/logos/school.svg",
} as const;

export function institutionLogoSrc(institution: InstitutionBranding): string {
  if (institution.level === "COLLEGE" && institution.collegeCode === "cst") {
    return INSTITUTION_LOGOS.cst;
  }

  if (
    institution.level === "SCHOOL" &&
    institution.schoolName.toLowerCase().includes("motithang")
  ) {
    return INSTITUTION_LOGOS.motithang;
  }

  return institution.level === "COLLEGE"
    ? INSTITUTION_LOGOS.rubCollege
    : INSTITUTION_LOGOS.school;
}

export function institutionShortLabel(institution: InstitutionBranding): string {
  if (institution.level === "COLLEGE" && institution.collegeCode) {
    return institution.collegeCode.toUpperCase();
  }
  if (institution.schoolName.toLowerCase().includes("motithang")) {
    return "Motithang HSS";
  }
  return institution.schoolName.split(" ")[0];
}

export function institutionHasCustomLogo(institution: InstitutionBranding): boolean {
  return (
    (institution.level === "COLLEGE" && institution.collegeCode === "cst") ||
    institution.schoolName.toLowerCase().includes("motithang")
  );
}
