"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Title,
  ChartOptions,
  TooltipItem,
  LineElement,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { chartsApi } from "@/lib/api/chartsApi";
import { ScoreDataPoint, ChartPeriod } from "@/types/habits";
import ChartCard from "./ChartCard";
import PeriodFilter from "./PeriodFilter";
import { isAxiosError } from "@/utils/errorHandlers";

ChartJS.register(
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title,
);

interface ScoreChartProps {
  habitId: string;
}

export default function ScoreChart({ habitId }: ScoreChartProps) {
  const [data, setData] = useState<ScoreDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<ChartPeriod>("day");

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const chartData = await chartsApi.getScoreChart(habitId, period);
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

    // Theme detection
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, [habitId, period]);

  const chartData = useMemo(() => {
    return {
      datasets: [
        {
          label: "Score",
          data: data.map((point) => ({
            x: new Date(point.date).getTime(),
            y: point.score,
            label: point.label,
          })),
          backgroundColor: isDark
            ? "rgba(16, 185, 129, 0.2)"
            : "rgba(16, 185, 129, 0.1)",
          borderColor: "#10b981", // emerald-500
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: "#10b981",
          pointBorderColor: isDark ? "#09090b" : "#ffffff",
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
  }, [data, isDark]);

  const options: ChartOptions<"line"> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: isDark ? "#18181b" : "#ffffff",
          titleColor: isDark ? "#f4f4f5" : "#18181b",
          bodyColor: isDark ? "#a1a1aa" : "#71717a",
          borderColor: isDark ? "#27272a" : "#e4e4e7",
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
          displayColors: false,
          callbacks: {
            title: (context: TooltipItem<"line">[]) => {
              const raw = context[0].raw as { x: number };
              return new Date(raw.x).toLocaleDateString(undefined, {
                weekday: "long",
              });
            },
            label: (context: TooltipItem<"line">) => {
              const raw = context.raw as {
                x: number;
                y: number;
                label?: string;
              };
              const dateStr = new Date(raw.x).toLocaleDateString(undefined, {
                month: "long",
                day: "numeric",
              });
              return `${dateStr}: ${raw.y}%`;
            },
          },
        },
      },
      scales: {
        x: {
          type: "linear",
          title: {
            display: false,
          },
          ticks: {
            color: isDark ? "#71717a" : "#a1a1aa",
            font: {
              size: 11,
            },
            callback: (value) => {
              return new Date(value as number).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              });
            },
          },
          grid: {
            display: false,
          },
        },
        y: {
          min: 0,
          max: 100,
          ticks: {
            color: isDark ? "#71717a" : "#a1a1aa",
            font: {
              size: 11,
            },
            stepSize: 20,
          },
          grid: {
            color: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
          },
        },
      },
    }),
    [isDark],
  );

  if (loading) {
    return (
      <div className="h-[320px] w-full flex items-center justify-center text-gray-400 text-sm">
        Loading chart...
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[320px] w-full flex items-center justify-center text-red-500 text-sm">
        {error}
      </div>
    );
  }

  return (
    <ChartCard
      title="Score"
      subtitle="Achievement percentage over time"
      loading={loading}
      error={error || undefined}
      action={<PeriodFilter value={period} onChange={setPeriod} />}
    >
      <div className="h-[220px] sm:h-[280px] w-full">
        <Line data={chartData} options={options} />
      </div>
    </ChartCard>
  );
}
