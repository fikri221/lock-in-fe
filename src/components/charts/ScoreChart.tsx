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
          backgroundColor: "rgba(34, 197, 94, 0.2)",
          borderColor: "rgba(34, 197, 94, 1)", // green-500
          borderWidth: 2,
          tension: 0.1,
          fill: true,
        },
      ],
    };
  }, [data]);

  const options: ChartOptions<"line"> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
        },
        tooltip: {
          callbacks: {
            label: (context: TooltipItem<"line">) => {
              const raw = context.raw as {
                x: number;
                y: number;
                label?: string;
              };
              return `${raw.label || new Date(raw.x).toLocaleDateString()}: ${
                raw.y
              }%`;
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
            callback: (value) => {
              return new Date(value as number).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              });
            },
          },
          grid: {
            color: "rgba(0, 0, 0, 0.05)",
          },
        },
        y: {
          min: 0,
          max: 100,
          title: {
            display: true,
            text: "Score (%)",
          },
          grid: {
            color: "rgba(0, 0, 0, 0.05)",
          },
        },
      },
    }),
    [],
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
