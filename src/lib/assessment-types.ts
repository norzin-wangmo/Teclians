export const ASSESSMENT_TYPES = [
  { value: "Assignment", label: "Assignment" },
  { value: "Quiz", label: "Quiz" },
  { value: "Unit Test", label: "Unit test" },
  { value: "Midterm Exam", label: "Midterm exam" },
  { value: "Final Exam", label: "Final exam" },
  { value: "Project", label: "Project" },
  { value: "Lab Work", label: "Lab work" },
  { value: "Presentation", label: "Presentation" },
  { value: "Class Participation", label: "Class participation" },
] as const;

export type AssessmentType = (typeof ASSESSMENT_TYPES)[number]["value"];

export function buildAssessmentTitle(type: string, name: string): string {
  const trimmed = name.trim();
  if (!type) return trimmed;
  if (!trimmed) return type;
  return `${type} — ${trimmed}`;
}
