import { BarChart3, Building2, FileBarChart, MapPin } from "lucide-react";
import { RoleFunctionsPanel } from "@/components/roles/role-functions-panel";

export function MinistryFunctions() {
  return (
    <RoleFunctionsPanel
      title="Ministry functions"
      subtitle="Policy-level analysis using summarized, anonymized data — no individual student records."
      items={[
        {
          icon: Building2,
          title: "Aggregated school analytics",
          description: "Regional statistics across all registered schools.",
          href: "#analytics",
        },
        {
          icon: BarChart3,
          title: "Compare school performance",
          description: "Side-by-side school and district comparisons.",
          href: "#comparison",
        },
        {
          icon: MapPin,
          title: "District-level trends",
          description: "Attendance and grade averages by district.",
          href: "#district-trends",
        },
        {
          icon: FileBarChart,
          title: "Regional monitoring reports",
          description: "Printable ministry summaries for policy planning.",
          href: "/dashboard/authority/report",
        },
      ]}
    />
  );
}
