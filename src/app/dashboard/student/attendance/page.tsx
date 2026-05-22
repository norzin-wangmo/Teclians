import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StudentAttendanceByModule } from "@/components/student/student-attendance-by-module";
import { DataPanel } from "@/components/ui/data-panel";
import { requireSession } from "@/lib/auth";
import { getInstitutionBranding } from "@/lib/institution";
import { studentNav } from "@/lib/nav";
import { getStudentAttendanceByModule } from "@/lib/student-enrollment-summary";

export default async function StudentAttendancePage() {
  const user = await requireSession(["STUDENT"]);
  const [modules, institution] = await Promise.all([
    getStudentAttendanceByModule(user.id),
    getInstitutionBranding(user.schoolId),
  ]);

  return (
    <DashboardShell
      user={user}
      title="Attendance records"
      subtitle="View every class session by module, with the date and your attendance status."
      nav={studentNav}
      institution={institution}
    >
      <DataPanel title="Attendance by module">
        <StudentAttendanceByModule modules={modules} />
      </DataPanel>
    </DashboardShell>
  );
}
