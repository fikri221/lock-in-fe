"use client";

import { useEffect, useState } from "react";
import ChartCard from "./ChartCard";
import { chartsApi } from "@/lib/api/chartsApi";
import { TargetChartData } from "@/types/habits";
import { isAxiosError } from "@/utils/errorHandlers";

interface TargetChartProps {
  habitId: string;
}

export default function TargetChart({ habitId }: TargetChartProps) {
  const [data, setData] = useState<TargetChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const chartData = await chartsApi.getTargetChart(habitId);
        console.log("chartData: ", chartData);
        setData(chartData);
        setError(null);
      } catch (err: unknown) {
        if (isAxiosError(err)) {
          setError(err.response?.data?.error || "Failed to fetch habits");
        } else if (err instanceof Error) {
          setError(err.message || "Failed to fetch habits");
        } else {
          setError("Failed to fetch habits");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [habitId]);

  const periods = [
    { key: "today", label: "Today" },
    { key: "week", label: "Week" },
    { key: "month", label: "Month" },
    { key: "quarter", label: "Quarter" },
    { key: "year", label: "Year" },
  ] as const;

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }
    return num.toString();
  };

  console.log("data: ", data);

  return (
    <ChartCard
      title="Target"
      subtitle="Progress towards your goals"
      loading={loading}
      error={error || undefined}
    >
      {data && (
        <div className="space-y-3">
          {periods.map(({ key, label }) => {
            const periodData = data[key];
            const percentage =
              periodData.target > 0
                ? Math.min(100, (periodData.actual / periodData.target) * 100)
                : 0;

            return (
              <div key={key} className="flex items-center gap-4">
                {/* Label */}
                <div className="w-20 text-sm font-medium text-gray-700">
                  {label}
                </div>

                {/* Progress Bar */}
                <div className="flex-1 bg-gray-100 rounded-full h-10 overflow-hidden relative">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-400 to-green-500 transition-all duration-500 ease-out"
                    style={{ width: `${percentage}%` }}
                  />
                  {/* Value Label inside bar */}
                  <div className="absolute inset-0 flex items-center px-4 text-sm font-bold">
                    <span
                      className={
                        percentage > 10 ? "text-white" : "text-gray-700"
                      }
                    >
                      {periodData.actual}
                    </span>
                  </div>
                </div>

                {/* Target Value */}
                <div className="w-24 text-right text-sm">
                  <span className="font-bold text-gray-900">
                    {formatNumber(periodData.actual)}
                  </span>
                  <span className="text-gray-500 mx-1">/</span>
                  <span className="text-gray-600">
                    {formatNumber(periodData.target)}
                  </span>
                  <span className="text-gray-500 mx-1">{data.unit}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </ChartCard>
  );
}
