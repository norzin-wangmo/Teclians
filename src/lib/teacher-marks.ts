import { prisma } from "@/lib/prisma";
import { getTeacherClassesWithStudents } from "@/lib/teacher";

export type StudentMarkCell = {
  gradeId: string;
  score: number;
  maxScore: number;
};

export type ClassMarksSheet = {
  classId: string;
  className: string;
  assessments: string[];
  students: {
    id: string;
    name: string;
    studentNumber: string | null;
    marks: Record<string, StudentMarkCell | undefined>;
  }[];
};

export async function getTeacherMarksSheets(teacherId: string): Promise<ClassMarksSheet[]> {
  const classes = await getTeacherClassesWithStudents(teacherId);
  const classIds = classes.map((c) => c.id);

  if (classIds.length === 0) return [];

  const grades = await prisma.grade.findMany({
    where: { classId: { in: classIds } },
    select: {
      id: true,
      studentId: true,
      classId: true,
      title: true,
      score: true,
      maxScore: true,
      recordedAt: true,
    },
    orderBy: [{ title: "asc" }, { recordedAt: "desc" }],
  });

  return classes.map((cls) => {
    const classGrades = grades.filter((g) => g.classId === cls.id);
    const assessments = [
      ...new Set(classGrades.map((g) => g.title.trim()).filter(Boolean)),
    ].sort((a, b) => a.localeCompare(b));

    const students = cls.students.map((student) => {
      const marks: Record<string, StudentMarkCell | undefined> = {};
      for (const title of assessments) {
        const grade = classGrades.find(
          (g) => g.studentId === student.id && g.title.trim() === title,
        );
        if (grade) {
          marks[title] = {
            gradeId: grade.id,
            score: grade.score,
            maxScore: grade.maxScore,
          };
        }
      }
      return {
        id: student.id,
        name: student.name,
        studentNumber: student.studentNumber,
        marks,
      };
    });

    return {
      classId: cls.id,
      className: cls.name,
      assessments,
      students,
    };
  });
}
