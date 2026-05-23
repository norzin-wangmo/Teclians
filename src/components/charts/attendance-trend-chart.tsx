"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Props = {
  labels: string[];
  rates: number[];
};

export function AttendanceTrendChart({ labels, rates }: Props) {
  const data = labels.map((label, i) => ({ month: label, rate: rates[i] }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
          <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#94a3b8" unit="%" />
          <Tooltip
            formatter={(value: number) => [`${value}%`, "Attendance"]}
            contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }}
          />
          <Line
            type="monotone"
            dataKey="rate"
            stroke="#239b76"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "#239b76" }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
