import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CsvImportForm } from "@/components/admin/csv-import-form";
import { requireSession } from "@/lib/auth";
import { adminNav } from "@/lib/nav";
import { getSchoolSettings } from "@/lib/school";

export default async function AdminImportPage() {
  const user = await requireSession(["ADMIN"]);
  const school = user.schoolId ? await getSchoolSettings(user.schoolId) : null;

  return (
    <DashboardShell
      user={user}
      title="Import student data"
      subtitle="Upload student records from CSV files. Excel spreadsheets can be saved as CSV before upload."
      nav={adminNav(school?.institutionLevel)}
    >
      <CsvImportForm />
    </DashboardShell>
  );
}
