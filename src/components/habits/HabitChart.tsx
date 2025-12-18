"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { format, subDays, startOfDay } from "date-fns";
import { useMemo } from "react";

interface HabitChartProps {
  habitId: string;
  days: number;
}

export default function HabitChart({ habitId, days }: HabitChartProps) {
  // Generate mock data for now - replace with real API call
  const data = useMemo(() => {
    const data = [];
    const today = startOfDay(new Date());

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(today, i);
      const completed = Math.random() > 0.3; // 70% completion rate (mock)

      data.push({
        date: format(date, "MMM dd"),
        fullDate: format(date, "yyyy-MM-dd"),
        value: completed ? 1 : 0,
        day: format(date, "EEE"),
      });
    }

    return data;
  }, [days]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-4 py-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">
            {payload[0].payload.date}
          </p>
          <p className="text-sm text-gray-600">
            {payload[0].value === 1 ? "✓ Completed" : "✗ Not completed"}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey={days <= 7 ? "day" : "date"}
            stroke="#9ca3af"
            style={{ fontSize: "12px" }}
            interval={days > 30 ? Math.floor(days / 10) : 0}
          />
          <YAxis
            stroke="#9ca3af"
            style={{ fontSize: "12px" }}
            ticks={[0, 1]}
            domain={[0, 1]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.value === 1 ? "#10b981" : "#e5e7eb"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
