import { prisma } from "@/lib/prisma";
import { formatModulesTaught } from "@/lib/teaching-modules";

export async function syncTeacherModules(
  schoolId: string,
  teacherId: string,
  teacherName: string,
  modules: string[],
  gradeLevel = 1,
) {
  const unique = [...new Set(modules.map((m) => m.trim()).filter(Boolean))];

  for (const subject of unique) {
    const existing = await prisma.class.findFirst({
      where: { schoolId, teacherId, subject },
    });
    if (!existing) {
      await prisma.class.create({
        data: {
          name: `${subject} — ${teacherName}`,
          subject,
          gradeLevel,
          schoolId,
          teacherId,
        },
      });
    }
  }

  await prisma.user.update({
    where: { id: teacherId },
    data: { modulesTaught: formatModulesTaught(unique) },
  });
}
