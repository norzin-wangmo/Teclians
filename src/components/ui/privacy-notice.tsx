import { Shield } from "lucide-react";

export function PrivacyNotice() {
  return (
    <div className="mb-6 flex gap-3 rounded-xl border border-brand-100 bg-brand-50/80 px-4 py-3 text-sm text-brand-900">
      <Shield className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
      <p>
        This view shows <strong>aggregated school and district statistics only</strong>. Individual
        student names, grades, and attendance records are not displayed — in line with privacy
        requirements for administrators and ministry officials.
      </p>
    </div>
  );
}
