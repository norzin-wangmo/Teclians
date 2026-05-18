/** Local part of an email (before @). */
export function emailLocalPart(email: string): string {
  return email.trim().toLowerCase().split("@")[0] ?? "";
}

function normalizeKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Display name from staff email: james.okonkwo → James Okonkwo */
export function formatStaffNameFromEmail(email: string): string {
  const local = emailLocalPart(email);
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/** Staff name must start with their education account (email local part). */
export function validateStaffNameMatchesEmail(name: string, email: string): string | null {
  const local = emailLocalPart(email);
  if (!local) return "Invalid education email.";

  const nameNorm = normalizeKey(name);
  const localNorm = normalizeKey(local);

  const matchesAccount =
    nameNorm.startsWith(localNorm) ||
    (nameNorm.length >= 3 && localNorm.startsWith(nameNorm));

  if (!matchesAccount) {
    return `Name must start with your education account (“${local}”), e.g. ${formatStaffNameFromEmail(email)}.`;
  }
  return null;
}

const STUDENT_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{2,63}$/;

export type StudentEmailInstitution = {
  emailDomain: string;
  institutionLevel?: "COLLEGE" | "SCHOOL";
};

export function validateStudentNumber(studentNumber: string): string | null {
  const id = studentNumber.trim();
  if (!id) return "Student ID is required.";
  if (!STUDENT_ID_PATTERN.test(id)) {
    return "Student ID must be 3–32 characters (letters, numbers, . _ -).";
  }
  return null;
}

export function buildStudentEmail(
  studentNumber: string,
  school: StudentEmailInstitution | string,
): string {
  const id = studentNumber.trim().toLowerCase();
  const emailDomain =
    typeof school === "string" ? school.trim().toLowerCase() : school.emailDomain.trim().toLowerCase();
  const level =
    typeof school === "string" ? "COLLEGE" : (school.institutionLevel ?? "COLLEGE");

  if (level === "SCHOOL" || emailDomain === "education.gov.bt") {
    return `${id}@${emailDomain}`;
  }

  return `${id}@student.${emailDomain}`;
}

export function isEmailLoginIdentifier(input: string): boolean {
  return input.includes("@");
}
