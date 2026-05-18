import {
  AlertTriangle,
  BarChart3,
  ClipboardCheck,
  FileBarChart,
  GraduationCap,
  LineChart,
  Users,
} from "lucide-react";
import { RoleFunctionsPanel } from "@/components/roles/role-functions-panel";

export function TeacherFunctions() {
  return (
    <RoleFunctionsPanel
      title="Teacher functions"
      subtitle="Log in, manage student records, record attendance, enter and update marks, and monitor class performance."
      items={[
        {
          icon: Users,
          title: "Manage student records",
          description: "Add, edit, delete, and search students in your classes.",
          href: "/dashboard/teacher/students",
        },
        {
          icon: ClipboardCheck,
          title: "Record attendance",
          description: "Log daily presence, absences, and late arrivals.",
          href: "#record-attendance",
        },
        {
          icon: GraduationCap,
          title: "Enter & update marks",
          description: "Record assessments and revise scores when needed.",
          href: "#update-grades",
        },
        {
          icon: BarChart3,
          title: "Class performance dashboards",
          description: "Visual analytics for your classes and subjects.",
          href: "#class-performance",
        },
        {
          icon: AlertTriangle,
          title: "Students requiring attention",
          description: "Flagged students with low attendance or grades.",
          href: "#at-risk",
        },
        {
          icon: FileBarChart,
          title: "Generate reports",
          description: "Printable class monitoring summaries.",
          href: "/dashboard/teacher/report",
        },
        {
          icon: LineChart,
          title: "Attendance trends",
          description: "School-wide attendance patterns over time.",
          href: "#attendance-trend",
        },
      ]}
    />
  );
}
