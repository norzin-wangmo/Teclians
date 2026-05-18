import { DashboardShell } from "@/components/layout/dashboard-shell";
import { TeacherManager } from "@/components/admin/teacher-manager";
import { requireSession } from "@/lib/auth";
import { adminNav } from "@/lib/nav";
import { STAFF_TEACHING_ROLES } from "@/lib/roles";
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

  const staff = await prisma.user.findMany({
    where: { schoolId: user.schoolId, role: { in: [...STAFF_TEACHING_ROLES] } },
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: "asc" },
  });

  return (
    <DashboardShell
      user={user}
      title="Teachers & lecturers"
      subtitle="Create accounts with institutional education emails only. Student accounts are managed separately."
      nav={adminNav}
    >
      <TeacherManager
        teachers={staff.map((s) => ({
          id: s.id,
          name: s.name,
          email: s.email,
          role: s.role as "TEACHER" | "LECTURER",
        }))}
      />
    </DashboardShell>
  );
}
