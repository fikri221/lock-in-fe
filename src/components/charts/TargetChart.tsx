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

  return (
    <ChartCard
      title="Target"
      subtitle="Progress towards your goals"
      loading={loading}
      error={error || undefined}
    >
      {data && (
        <div className="flex justify-between items-end gap-2 sm:gap-4 mt-6 h-64">
          {periods.map(({ key, label }) => {
            const periodData = data[key];
            const percentage =
              periodData.target > 0
                ? Math.min(100, (periodData.actual / periodData.target) * 100)
                : 0;

            return (
              <div
                key={key}
                className="flex flex-col items-center flex-1 h-full justify-end group"
              >
                {/* Value Label (Top) */}
                <div className="text-center mb-2 flex flex-col items-center justify-end h-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300 md:opacity-100">
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {formatNumber(periodData.actual)}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    / {formatNumber(periodData.target)} {data.unit}
                  </span>
                </div>

                {/* Vertical Progress Bar */}
                <div className="w-12 sm:w-16 bg-zinc-100 dark:bg-zinc-800 rounded-xl h-32 sm:h-40 overflow-hidden relative flex items-end justify-center shadow-inner">
                  <div
                    className="w-full bg-gradient-to-t from-emerald-400 to-emerald-500 transition-all duration-700 ease-out rounded-b-xl rounded-t-sm"
                    style={{ height: `${percentage}%` }}
                  />

                  {/* Percentage Indicator inside or above */}
                  {percentage > 0 && (
                    <div className="absolute bottom-2 text-[10px] sm:text-xs font-bold text-white drop-shadow-md">
                      {Math.round(percentage)}%
                    </div>
                  )}
                </div>

                {/* Label (Bottom) */}
                <div className="mt-3 text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 text-center">
                  {label}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </ChartCard>
  );
}
