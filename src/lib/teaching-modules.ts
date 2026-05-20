/** Suggested modules when creating teacher accounts (college / school). */
export const COLLEGE_MODULE_SUGGESTIONS = [
  "Software Engineering",
  "Engineering Mathematics",
  "Programming Fundamentals",
  "Database Systems",
  "Computer Networks",
  "Physics",
  "Chemistry",
  "English",
] as const;

export const SCHOOL_MODULE_SUGGESTIONS = [
  "Science",
  "Mathematics",
  "English",
  "Dzongkha",
  "Social Studies",
  "ICT",
] as const;

export function parseModulesTaught(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return [];
  return [...new Set(raw.split(",").map((s) => s.trim()).filter(Boolean))];
}

export function formatModulesTaught(modules: string[]): string | null {
  const list = [...new Set(modules.map((m) => m.trim()).filter(Boolean))];
  return list.length > 0 ? list.join(", ") : null;
}

export function mergeModuleSuggestions(
  institutionLevel: "COLLEGE" | "SCHOOL",
  existingSubjects: string[],
): string[] {
  const base =
    institutionLevel === "COLLEGE"
      ? [...COLLEGE_MODULE_SUGGESTIONS]
      : [...SCHOOL_MODULE_SUGGESTIONS];
  return [...new Set([...base, ...existingSubjects])].sort((a, b) => a.localeCompare(b));
}
