"use client";

import { Printer } from "lucide-react";

export function PrintReportButton({ label = "Print report" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
    >
      <Printer className="h-4 w-4" />
      {label}
    </button>
  );
}
