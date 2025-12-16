"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface HabitData {
  fullDate: string;
  completed: number;
  mood?: number;
  energy?: number;
}

interface HabitChartProps {
  habitId: string;
  days: number;
}

export default function HabitChart({ habitId, days }: HabitChartProps) {
  const [data, setData] = useState<HabitData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`/api/habits/${habitId}`);
      const data = await response.json();
      setData(data);
    };
    fetchData();
  }, [habitId, days]);

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ value: number; payload: HabitData }>;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-4 py-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">
            {payload[0].payload.fullDate}
          </p>
          <p className="text-sm text-gray-600">
            {payload[0].value === 1 ? "✓ Completed" : "✗ Not completed"}
          </p>
          {payload[0].payload.mood && (
            <p className="text-sm text-gray-600">
              Mood: {payload[0].payload.mood}/5
            </p>
          )}
          {payload[0].payload.energy && (
            <p className="text-sm text-gray-600">
              Energy: {payload[0].payload.energy}/5
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p>No data available yet</p>
          <p className="text-sm mt-2">
            Start completing this habit to see your progress!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey={days <= 7 ? "day" : "fullDate"}
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
          <Bar dataKey="completed" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.completed === 1 ? "#10b981" : "#e5e7eb"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
