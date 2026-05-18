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
import type { ClassAnalytics } from "@/lib/types";

export function ClassPerformanceChart({ classes }: { classes: ClassAnalytics[] }) {
  const data = classes.map((c) => ({
    name: c.className.includes(" — ")
      ? (c.className.split(" — ").pop() ?? c.className)
      : c.className.replace(/^Grade \d+ /, ""),
    attendance: c.attendanceRate,
    grades: c.averageGrade,
  }));

  if (data.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-[var(--muted)]">
        No class data available yet.
      </p>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
          <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
          <Legend />
          <Bar dataKey="attendance" name="Attendance %" fill="#1d4ed8" radius={[6, 6, 0, 0]} />
          <Bar dataKey="grades" name="Avg Grade %" fill="#0d9488" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
