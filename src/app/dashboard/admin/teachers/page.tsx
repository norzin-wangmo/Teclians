import { DashboardShell } from "@/components/layout/dashboard-shell";
import { TeacherManager } from "@/components/admin/teacher-manager";
import { requireSession } from "@/lib/auth";
import { adminNav } from "@/lib/nav";
import { STAFF_TEACHING_ROLES } from "@/lib/roles";
import { getSchoolSettings } from "@/lib/school";
import { mergeModuleSuggestions } from "@/lib/teaching-modules";
import { prisma } from "@/lib/prisma";

export default async function AdminTeachersPage() {
  const user = await requireSession(["ADMIN"]);
  if (!user.schoolId) {
    return (
      <DashboardShell user={user} title="Teachers & lecturers" nav={adminNav}>
        <p className="text-sm text-[var(--muted)]">No school linked.</p>
      </DashboardShell>
    );
  }

  const [staff, classes, school] = await Promise.all([
    prisma.user.findMany({
      where: { schoolId: user.schoolId, role: { in: [...STAFF_TEACHING_ROLES] } },
      select: { id: true, name: true, email: true, role: true, modulesTaught: true },
      orderBy: { name: "asc" },
    }),
    prisma.class.findMany({
      where: { schoolId: user.schoolId },
      select: { subject: true },
    }),
    getSchoolSettings(user.schoolId),
  ]);

  const moduleOptions = mergeModuleSuggestions(
    school?.institutionLevel ?? "COLLEGE",
    classes.map((c) => c.subject),
  );

  return (
    <DashboardShell
      user={user}
      title="Teachers & lecturers"
      subtitle="Create accounts with institutional education emails and assign modules they teach."
      nav={adminNav}
    >
      <TeacherManager
        teachers={staff.map((s) => ({
          id: s.id,
          name: s.name,
          email: s.email,
          role: s.role as "TEACHER" | "LECTURER",
          modulesTaught: s.modulesTaught,
        }))}
        moduleOptions={moduleOptions}
      />
    </DashboardShell>
  );
}
