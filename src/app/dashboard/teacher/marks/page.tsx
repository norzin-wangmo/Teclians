import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StudentMarksViewer } from "@/components/teacher/student-marks-viewer";
import { DataPanel } from "@/components/ui/data-panel";
import { requireSession } from "@/lib/auth";
import { getInstitutionBranding } from "@/lib/institution";
import { lecturerNav } from "@/lib/nav";
import { STAFF_TEACHING_ROLES } from "@/lib/roles";
import { getTeacherMarksSheets } from "@/lib/teacher-marks";

export default async function TeacherMarksPage() {
  const user = await requireSession([...STAFF_TEACHING_ROLES]);
  const [sheets, institution] = await Promise.all([
    getTeacherMarksSheets(user.id),
    getInstitutionBranding(user.schoolId),
  ]);

  return (
    <DashboardShell
      user={user}
      title="Student marks"
      subtitle="View each student's scores for quizzes, assignments, midterms, and other assessments."
      nav={lecturerNav}
      institution={institution}
    >
      <DataPanel title="Marks by class and assessment">
        <StudentMarksViewer sheets={sheets} />
      </DataPanel>
    </DashboardShell>
  );
}
