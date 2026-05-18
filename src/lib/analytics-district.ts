import { getAuthorityAnalytics } from "@/lib/analytics";

export type DistrictSummary = {
  district: string;
  schoolCount: number;
  studentCount: number;
  attendanceRate: number;
  averageGrade: number;
};

export async function getDistrictSummaries(): Promise<DistrictSummary[]> {
  const schools = await getAuthorityAnalytics();
  const map = new Map<string, DistrictSummary & { attSum: number; gradeSum: number }>();

  for (const school of schools) {
    const existing = map.get(school.district) ?? {
      district: school.district,
      schoolCount: 0,
      studentCount: 0,
      attendanceRate: 0,
      averageGrade: 0,
      attSum: 0,
      gradeSum: 0,
    };

    existing.schoolCount += 1;
    existing.studentCount += school.studentCount;
    existing.attSum += school.attendanceRate;
    existing.gradeSum += school.averageGrade;
    map.set(school.district, existing);
  }

  return [...map.values()]
    .map((d) => ({
      district: d.district,
      schoolCount: d.schoolCount,
      studentCount: d.studentCount,
      attendanceRate: Math.round((d.attSum / d.schoolCount) * 10) / 10,
      averageGrade: Math.round((d.gradeSum / d.schoolCount) * 10) / 10,
    }))
    .sort((a, b) => a.district.localeCompare(b.district));
}
