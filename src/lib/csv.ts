export type StudentCsvRow = {
  studentNumber: string;
  className?: string;
};

export function parseStudentCsv(text: string): { rows: StudentCsvRow[]; errors: string[] } {
  const lines = text
    .trim()
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return { rows: [], errors: ["File is empty"] };
  }

  const header = lines[0].toLowerCase().split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const idIdx = header.findIndex(
    (h) => h === "studentid" || h === "student_id" || h === "studentnumber" || h === "id",
  );
  const classIdx = header.findIndex((h) => h === "classname" || h === "class" || h === "class_name");

  if (idIdx === -1) {
    return {
      rows: [],
      errors: ["CSV must include a studentId column (student ID). Optional: className"],
    };
  }

  const rows: StudentCsvRow[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    const studentNumber = cols[idIdx]?.trim();
    const className = classIdx >= 0 ? cols[classIdx]?.trim() : undefined;

    if (!studentNumber) {
      errors.push(`Row ${i + 1}: student ID is required`);
      continue;
    }

    rows.push({ studentNumber, className: className || undefined });
  }

  return { rows, errors };
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  result.push(current);
  return result.map((c) => c.trim());
}
