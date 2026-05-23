"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ModuleAnalytics } from "@/lib/types";

export function ModulePerformanceChart({ modules }: { modules: ModuleAnalytics[] }) {
  const data = modules.map((m) => ({
    module: m.module,
    attendance: m.attendanceRate,
    grades: m.averageGrade,
  }));

  if (data.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-[var(--muted)]">
        No module performance data yet.
      </p>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="module" tick={{ fontSize: 12 }} stroke="#94a3b8" />
          <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
          <Legend />
          <Bar dataKey="attendance" name="Attendance %" fill="#239b76" radius={[6, 6, 0, 0]} />
          <Bar dataKey="grades" name="Avg Grade %" fill="#1d8263" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
