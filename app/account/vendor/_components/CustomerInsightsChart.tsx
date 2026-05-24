"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function CustomerInsightsChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">

      <BarChart
        data={data}
        barSize={55}
      >

        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="#E5E7EB"
        />

        <XAxis
          dataKey="name"
          tick={{
            fontSize: 11,
            fontWeight: 700,
            fill: "#6B7280",
          }}
          axisLine={false}
          tickLine={false}
        />

        <Tooltip
          contentStyle={{
            borderRadius: "1rem",
            border: "1px solid #F3F4F6",
            fontSize: "12px",
            fontWeight: "700",
          }}
        />

        <Bar
          dataKey="value"
          radius={[16, 16, 0, 0]}
          fill="#F7931E"
        />

      </BarChart>

    </ResponsiveContainer>
  );
}