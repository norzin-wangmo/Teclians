import { ClipboardCheck, LineChart, Lock, NotebookPen } from "lucide-react";
import { RoleFunctionsPanel } from "@/components/roles/role-functions-panel";

export function StudentFunctions() {
  return (
    <RoleFunctionsPanel
      title="Student functions"
      subtitle="Access your own academic information only — attendance, marks, progress, and trends."
      items={[
        {
          icon: Lock,
          title: "Secure login",
          description: "Private access to your personal academic records.",
        },
        {
          icon: ClipboardCheck,
          title: "View attendance records",
          description: "See your full attendance history by class.",
          href: "#attendance-records",
        },
        {
          icon: NotebookPen,
          title: "View subject marks",
          description: "Assessment scores grouped by subject.",
          href: "#subject-marks",
        },
        {
          icon: LineChart,
          title: "Track progress & trends",
          description: "Performance trends and summary statistics.",
          href: "#trends",
        },
      ]}
    />
  );
}
