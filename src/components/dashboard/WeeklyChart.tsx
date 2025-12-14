// src/components/dashboard/WeeklyChart.tsx
import { Habit } from "@/types/habits";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface WeeklyChartProps {
  habits: Habit[];
}

export default function WeeklyChart({ habits }: WeeklyChartProps) {
  // Generate last 7 days data
  const data = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));

    // Deterministic mock data to avoid hydration mismatch
    const params = [0.7, 0.4, 0.9, 0.6, 0.8, 0.5, 0.75];
    const completedCount = Math.floor((params[i] || 0.5) * habits.length);

    return {
      name: date.toLocaleDateString("en-US", { weekday: "short" }),
      completed: completedCount, // Deterministic Mock data
      total: habits.length,
    };
  });

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          Weekly Progress
        </h2>
        <p className="text-gray-600">
          Your habit completion over the last 7 days
        </p>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="name"
              stroke="#9ca3af"
              style={{ fontSize: "12px" }}
            />
            <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
            />
            <Bar
              dataKey="completed"
              fill="url(#colorGradient)"
              radius={[8, 8, 0, 0]}
            />
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={1} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">Average completion</p>
          <p className="text-2xl font-bold text-gray-900">
            {Math.round(
              (data.reduce((acc, d) => acc + d.completed, 0) /
                data.length /
                habits.length) *
                100
            )}
            %
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Best day</p>
          <p className="text-2xl font-bold text-gray-900">
            {
              data.reduce((max, d) => (d.completed > max.completed ? d : max))
                .name
            }
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Total habits</p>
          <p className="text-2xl font-bold text-gray-900">{habits.length}</p>
        </div>
      </div>
    </div>
  );
}
