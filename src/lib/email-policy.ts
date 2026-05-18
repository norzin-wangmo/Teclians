/**
 * Only institutional / education email addresses may register or sign in.
 * Configure extra domains via ALLOWED_EMAIL_DOMAINS (comma-separated) in .env
 */

const EDUCATION_SUFFIXES = [
  ".edu",
  ".edu.au",
  ".edu.nz",
  ".edu.sg",
  ".ac.uk",
  ".ac.nz",
  ".ac.in",
  ".edu.in",
  ".school.edu",
];

function getAllowedDomains(): string[] {
  const fromEnv = process.env.ALLOWED_EMAIL_DOMAINS?.split(",").map((d) => d.trim().toLowerCase()) ?? [];
  return fromEnv.filter(Boolean);
}

function emailDomain(email: string): string | null {
  const parts = email.trim().toLowerCase().split("@");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  return parts[1];
}

export function isEducationEmail(email: string): boolean {
  const domain = emailDomain(email);
  if (!domain) return false;

  const allowed = getAllowedDomains();
  if (allowed.some((d) => domain === d || domain.endsWith(`.${d}`))) {
    return true;
  }

  if (domain.includes(".edu")) return true;

  return EDUCATION_SUFFIXES.some(
    (suffix) => domain === suffix.slice(1) || domain.endsWith(suffix),
  );
}

/** Teachers and lecturers must use institutional staff mail. */
export function validateStaffEmail(email: string): string | null {
  if (!isEducationEmail(email)) {
    return "Only institutional education email addresses are allowed (e.g. name@school.edu).";
  }
  return null;
}

/** Student accounts also require an education-domain address. */
export function validateStudentEmail(email: string): string | null {
  if (!isEducationEmail(email)) {
    return "Student email must be an institutional education address (e.g. name@student.school.edu).";
  }
  return null;
}

export function validateLoginEmail(email: string): string | null {
  if (!isEducationEmail(email)) {
    return "Sign-in is restricted to institutional education email accounts.";
  }
  return null;
}

export const EDUCATION_EMAIL_HINT =
  "Use your school or university email (@edu, @ac.uk, or domains listed by your institution).";
