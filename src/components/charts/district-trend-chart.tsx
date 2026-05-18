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
import type { DistrictSummary } from "@/lib/analytics-district";

export function DistrictTrendChart({ districts }: { districts: DistrictSummary[] }) {
  const data = districts.map((d) => ({
    district: d.district,
    attendance: d.attendanceRate,
    grades: d.averageGrade,
    schools: d.schoolCount,
  }));

  if (data.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-[var(--muted)]">No district data available.</p>
    );
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="district" tick={{ fontSize: 11 }} stroke="#94a3b8" />
          <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
          <Legend />
          <Bar dataKey="attendance" name="Avg attendance %" fill="#1d4ed8" radius={[6, 6, 0, 0]} />
          <Bar dataKey="grades" name="Avg grade %" fill="#0d9488" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
