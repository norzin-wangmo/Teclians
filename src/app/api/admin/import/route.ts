import type { User } from "@prisma/client";
import { NextResponse } from "next/server";
import { hashPassword, requireSessionApi } from "@/lib/auth";
import { buildStudentEmail, validateStudentNumber } from "@/lib/account-naming";
import { parseStudentCsv } from "@/lib/csv";
import { validateStudentEmail } from "@/lib/email-policy";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await requireSessionApi(["ADMIN"]);
  if (!session?.schoolId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const school = await prisma.school.findUnique({ where: { id: session.schoolId } });
  if (!school) {
    return NextResponse.json({ error: "School not found" }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "CSV file is required" }, { status: 400 });
  }

  const text = await file.text();
  const { rows, errors: parseErrors } = parseStudentCsv(text);

  if (rows.length === 0) {
    return NextResponse.json(
      { error: "No valid rows", details: parseErrors },
      { status: 400 },
    );
  }

  const classes = await prisma.class.findMany({
    where: { schoolId: session.schoolId },
    select: { id: true, name: true },
  });
  const classByName = new Map(classes.map((c) => [c.name.toLowerCase(), c.id]));

  let created = 0;
  let updated = 0;
  const errors = [...parseErrors];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2;

    try {
      const idError = validateStudentNumber(row.studentNumber);
      if (idError) {
        errors.push(`Row ${rowNum}: ${idError}`);
        continue;
      }

      const email = buildStudentEmail(row.studentNumber, {
        emailDomain: school.emailDomain,
        institutionLevel: school.institutionLevel,
      });
      const emailError = validateStudentEmail(email);
      if (emailError) {
        errors.push(`Row ${rowNum}: ${emailError}`);
        continue;
      }

      let student: User | null = await prisma.user.findFirst({
        where: { schoolId: session.schoolId, studentNumber: row.studentNumber },
      });

      if (!student) {
        student = await prisma.user.findUnique({ where: { email } });
      }

      if (student && student.role !== "STUDENT") {
        errors.push(`Row ${rowNum}: email belongs to a non-student account`);
        continue;
      }

      if (!student) {
        student = await prisma.user.create({
          data: {
            name: row.studentNumber,
            studentNumber: row.studentNumber,
            email,
            role: "STUDENT",
            schoolId: session.schoolId,
            passwordHash: await hashPassword("password123"),
          },
        });
        created += 1;
      } else if (student.schoolId !== session.schoolId) {
        errors.push(`Row ${rowNum}: student belongs to another school`);
        continue;
      } else {
        await prisma.user.update({
          where: { id: student.id },
          data: {
            name: row.studentNumber,
            studentNumber: row.studentNumber,
            email,
          },
        });
        updated += 1;
      }

      if (row.className) {
        const classId = classByName.get(row.className.toLowerCase());
        if (!classId) {
          errors.push(`Row ${rowNum}: class "${row.className}" not found`);
        } else {
          await prisma.enrollment.upsert({
            where: {
              studentId_classId: { studentId: student.id, classId },
            },
            create: { studentId: student.id, classId },
            update: {},
          });
        }
      }
    } catch {
      errors.push(`Row ${rowNum}: failed to import`);
    }
  }

  return NextResponse.json({
    created,
    updated,
    total: rows.length,
    errors,
  });
}
