import { DashboardShell } from "@/components/layout/dashboard-shell";
import { AdminClassPerformance } from "@/components/admin/admin-class-performance";
import { DataPanel } from "@/components/ui/data-panel";
import { PrivacyNotice } from "@/components/ui/privacy-notice";
import { requireSession } from "@/lib/auth";
import {
  getAdminCohortFilters,
  getCohortClassPerformance,
} from "@/lib/admin-class-performance";
import { adminNav } from "@/lib/nav";

export default async function AdminClassPerformancePage() {
  const user = await requireSession(["ADMIN"]);
  if (!user.schoolId) {
    return (
      <DashboardShell user={user} title="Class performance" nav={adminNav}>
        <p className="text-sm text-[var(--muted)]">No school linked to this account.</p>
      </DashboardShell>
    );
  }

  const cohorts = await getAdminCohortFilters(user.schoolId);
  const dataByCohort: Record<
    string,
    Awaited<ReturnType<typeof getCohortClassPerformance>>
  > = {};

  for (const cohort of cohorts) {
    const key = `${cohort.department}::${cohort.yearOfStudy}`;
    dataByCohort[key] = await getCohortClassPerformance(user.schoolId, cohort);
  }

  return (
    <DashboardShell
      user={user}
      title="Class performance by cohort"
      subtitle="Select department and year to view module averages and students with attendance below 90%."
      nav={adminNav}
    >
      <PrivacyNotice />
      <DataPanel title="Cohort performance">
        <AdminClassPerformance cohorts={cohorts} dataByCohort={dataByCohort} />
      </DataPanel>
    </DashboardShell>
  );
}
