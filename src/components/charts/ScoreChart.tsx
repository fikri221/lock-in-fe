"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import ChartCard from "./ChartCard";
import PeriodFilter from "./PeriodFilter";
import { chartsApi } from "@/lib/api/chartsApi";
import { ScoreDataPoint, ChartPeriod } from "@/types/habits";

interface ScoreChartProps {
  habitId: string;
}

export default function ScoreChart({ habitId }: ScoreChartProps) {
  const [data, setData] = useState<ScoreDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<ChartPeriod>("day");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const chartData = await chartsApi.getScoreChart(habitId, period);
        setData(chartData);
        setError(null);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load score data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [habitId, period]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg">
          <p className="font-semibold text-sm">{payload[0].payload.label}</p>
          <p className="text-xs text-green-300 mt-1">
            Score: {payload[0].value}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ChartCard
      title="Score"
      subtitle="Achievement percentage over time"
      loading={loading}
      error={error || undefined}
      action={<PeriodFilter value={period} onChange={setPeriod} />}
    >
      {data.length > 0 && (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 5, bottom: 5, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="label"
                stroke="#9ca3af"
                style={{ fontSize: "12px" }}
              />
              <YAxis
                stroke="#9ca3af"
                style={{ fontSize: "12px" }}
                domain={[0, 100]}
                ticks={[0, 20, 40, 60, 80, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: "#10b981", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}
