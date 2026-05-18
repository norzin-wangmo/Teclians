import {
  FileBarChart,
  FileSpreadsheet,
  LineChart,
  Upload,
  UserPlus,
  Users,
} from "lucide-react";
import { RoleFunctionsPanel } from "@/components/roles/role-functions-panel";

export function AdminFunctions() {
  return (
    <RoleFunctionsPanel
      title="Administrator functions"
      subtitle="Oversee school-wide academic data, manage teachers, import student records, and generate reports."
      items={[
        {
          icon: UserPlus,
          title: "Manage student records",
          description: "Add, edit, delete, and search students across the school.",
          href: "/dashboard/admin/students",
        },
        {
          icon: Users,
          title: "Manage teacher accounts",
          description: "Create and update teacher login credentials.",
          href: "/dashboard/admin/teachers",
        },
        {
          icon: LineChart,
          title: "School-wide analytics",
          description: "Aggregated attendance and academic summaries.",
          href: "#analytics",
        },
        {
          icon: FileBarChart,
          title: "Generate reports",
          description: "Printable school performance reports.",
          href: "/dashboard/admin/report",
        },
        {
          icon: Upload,
          title: "Import student data",
          description: "Bulk upload via CSV (export Excel files to CSV).",
          href: "/dashboard/admin/import",
        },
        {
          icon: FileSpreadsheet,
          title: "Monitor summaries",
          description: "Subject-wise and class-level performance overview.",
          href: "#summaries",
        },
      ]}
    />
  );
}
