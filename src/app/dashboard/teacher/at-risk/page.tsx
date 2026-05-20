import { DashboardShell } from "@/components/layout/dashboard-shell";
import { AtRiskStudents } from "@/components/teacher/at-risk-students";
import { DataPanel } from "@/components/ui/data-panel";
import { requireSession } from "@/lib/auth";
import { getStudentsRequiringAttention } from "@/lib/at-risk";
import { getInstitutionBranding } from "@/lib/institution";
import { teacherNav } from "@/lib/nav";
import { STAFF_TEACHING_ROLES } from "@/lib/roles";

export default async function TeacherAtRiskPage() {
  const user = await requireSession([...STAFF_TEACHING_ROLES]);
  const [atRisk, institution] = await Promise.all([
    getStudentsRequiringAttention(user.id),
    getInstitutionBranding(user.schoolId),
  ]);

  return (
    <DashboardShell
      user={user}
      title="Students requiring attention"
      subtitle="Students flagged for low attendance or grades in your classes."
      nav={teacherNav}
      institution={institution}
    >
      <DataPanel title="At-risk students">
        <AtRiskStudents students={atRisk} />
      </DataPanel>
    </DashboardShell>
  );
}
