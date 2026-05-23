import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StudentManagementInfo } from "@/components/students/student-management-info";
import { StudentManager } from "@/components/teacher/student-manager";
import { requireSession } from "@/lib/auth";
import { STAFF_TEACHING_ROLES } from "@/lib/roles";
import { lecturerNav } from "@/lib/nav";
import { getInstitutionBranding } from "@/lib/institution";
import { getSchoolSettings } from "@/lib/school";
import { getTeacherStudents } from "@/lib/students";
import { getTeacherClassesWithStudents } from "@/lib/teacher";

export default async function TeacherStudentsPage() {
  const user = await requireSession([...STAFF_TEACHING_ROLES]);

  if (!user.schoolId) {
    return (
      <DashboardShell user={user} title="Student management" nav={lecturerNav}>
        <p className="text-sm text-[var(--muted)]">
          No college or school is linked to your account. Sign out and sign in again after your
          administrator assigns you to an institution.
        </p>
      </DashboardShell>
    );
  }

  const [classes, students, school, institution] = await Promise.all([
    getTeacherClassesWithStudents(user.id),
    getTeacherStudents(user.id),
    getSchoolSettings(user.schoolId),
    getInstitutionBranding(user.schoolId),
  ]);

  if (!school) {
    return (
      <DashboardShell user={user} title="Student management" nav={lecturerNav}>
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
      subtitle="Add, edit, delete, and search student records for your classes."
      nav={lecturerNav}
      institution={institution}
    >
      <StudentManagementInfo />
      <p className="mb-4 rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-900">
        Add student login accounts for your classes below, or students can self-register at{" "}
        <strong>/signup</strong>. Enroll each new student in at least one of your classes.
      </p>
      <StudentManager
        classes={classes.map((c) => ({ id: c.id, name: c.name }))}
        students={students}
        schoolEmailDomain={school.emailDomain}
        institutionLevel={school.institutionLevel}
        allowCreate
        allowEditStudentId={false}
      />
    </DashboardShell>
  );
}
