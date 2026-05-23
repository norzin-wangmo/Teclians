"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SchoolAnalytics } from "@/lib/types";

export function SchoolComparisonChart({ schools }: { schools: SchoolAnalytics[] }) {
  const data = schools.map((s) => ({
    school: s.schoolName.replace(" School", "").replace(" Academy", ""),
    attendance: s.attendanceRate,
    grades: s.averageGrade,
  }));

  if (data.length === 0) {
    return <p className="py-12 text-center text-sm text-[var(--muted)]">No schools in the region yet.</p>;
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
          <YAxis type="category" dataKey="school" width={120} tick={{ fontSize: 12 }} />
          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
          <Bar dataKey="attendance" name="Attendance %" fill="#239b76" radius={[0, 4, 4, 0]} />
          <Bar dataKey="grades" name="Avg Grade %" fill="#1d8263" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
