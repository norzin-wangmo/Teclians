import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StudentManagementInfo } from "@/components/students/student-management-info";
import { StudentManager } from "@/components/teacher/student-manager";
import { requireSession } from "@/lib/auth";
import { adminNav } from "@/lib/nav";
import { getSchoolSettings } from "@/lib/school";
import { getSchoolStudents } from "@/lib/students";
import { prisma } from "@/lib/prisma";

export default async function AdminStudentsPage() {
  const user = await requireSession(["ADMIN"]);

  if (!user.schoolId) {
    return (
      <DashboardShell user={user} title="Student management" nav={adminNav}>
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
      <DashboardShell user={user} title="Student management" nav={adminNav}>
        <p className="text-sm text-[var(--muted)]">
          Your institution record could not be loaded. Sign out and sign in again (this can happen
          after the database is reseeded).
        </p>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      user={user}
      title="Student management"
      subtitle="Manage all student records for your school — add, edit, delete, and search."
      nav={adminNav}
    >
      <StudentManagementInfo />
      <StudentManager
        classes={classes}
        students={students}
        schoolEmailDomain={school.emailDomain}
        institutionLevel={school.institutionLevel}
        canDelete
      />
    </DashboardShell>
  );
}
