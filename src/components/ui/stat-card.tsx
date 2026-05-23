import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: "brand" | "forest" | "amber" | "rose";
};

const tones = {
  brand: "bg-brand-50 text-brand-700 border-brand-100",
  forest: "bg-brand-100 text-brand-800 border-brand-200",
  amber: "bg-amber-50 text-amber-700 border-amber-100",
  rose: "bg-rose-50 text-rose-700 border-rose-100",
};

export function StatCard({ label, value, hint, icon: Icon, tone = "brand" }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
      <div className={`mb-4 inline-flex rounded-xl border p-2.5 ${tones[tone]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm font-medium text-[var(--muted)]">{label}</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
      {hint ? <p className="mt-2 text-xs text-[var(--muted)]">{hint}</p> : null}
    </div>
  );
}
