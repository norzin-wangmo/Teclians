import { prisma } from "@/lib/prisma";

export async function getTeacherClassesWithStudents(teacherId: string) {
  const classes = await prisma.class.findMany({
    where: { teacherId },
    include: {
      enrollments: {
        include: {
          student: { select: { id: true, name: true, studentNumber: true } },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return classes.map((cls) => ({
    id: cls.id,
    name: cls.name,
    students: cls.enrollments.map((e) => ({
      id: e.student.id,
      name: e.student.name,
      studentNumber: e.student.studentNumber,
    })),
  }));
}
