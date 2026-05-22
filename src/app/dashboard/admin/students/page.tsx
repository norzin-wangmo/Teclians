import { DashboardShell } from "@/components/layout/dashboard-shell";
import { AdminStudentsByClass } from "@/components/admin/admin-students-by-class";
import { requireSession } from "@/lib/auth";
import { adminNav } from "@/lib/nav";
import { getSchoolSettings } from "@/lib/school";
import { getSchoolStudents } from "@/lib/students";
import { prisma } from "@/lib/prisma";

export default async function AdminStudentsPage() {
  const user = await requireSession(["ADMIN"]);
  const schoolMeta = user.schoolId ? await getSchoolSettings(user.schoolId) : null;
  const nav = adminNav(schoolMeta?.institutionLevel);

  if (!user.schoolId) {
    return (
      <DashboardShell user={user} title="Student management" nav={nav}>
        <p className="text-sm text-[var(--muted)]">No school linked to this account.</p>
      </DashboardShell>
    );
  }

  const [students, classes, school] = await Promise.all([
    getSchoolStudents(user.schoolId),
    prisma.class.findMany({
      where: { schoolId: user.schoolId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    getSchoolSettings(user.schoolId),
  ]);

  if (!school) {
    return (
      <DashboardShell user={user} title="Student management" nav={nav}>
        <p className="text-sm text-[var(--muted)]">
          Your institution record could not be loaded. Sign out and sign in again.
        </p>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      user={user}
      title="Student management"
      subtitle="Choose a class to view students sorted by year and department."
      nav={nav}
    >
      <AdminStudentsByClass
        classes={classes}
        students={students}
        schoolEmailDomain={school.emailDomain}
        institutionLevel={school.institutionLevel}
      />
    </DashboardShell>
  );
}
