"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import ChartCard from "./ChartCard";
import PeriodFilter from "./PeriodFilter";
import { chartsApi } from "@/lib/api/chartsApi";
import { HistoryDataPoint, ChartPeriod } from "@/types/habits";

interface HistoryChartProps {
  habitId: string;
}

export default function HistoryChart({ habitId }: HistoryChartProps) {
  const [data, setData] = useState<HistoryDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<ChartPeriod>("day");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const chartData = await chartsApi.getHistoryChart(habitId, period);
        setData(chartData);
        setError(null);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load history data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [habitId, period]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const date = new Date(payload[0].payload.date);
      return (
        <div className="bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg">
          <p className="font-semibold text-sm">
            {date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </p>
          <p className="text-xs text-green-300 mt-1">
            Value: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ChartCard
      title="History"
      subtitle="Actual values achieved"
      loading={loading}
      error={error || undefined}
      action={<PeriodFilter value={period} onChange={setPeriod} />}
    >
      {data.length > 0 && (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 5, right: 5, bottom: 5, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                stroke="#9ca3af"
                style={{ fontSize: "12px" }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.getDate().toString();
                }}
              />
              <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}
