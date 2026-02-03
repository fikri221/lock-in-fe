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
} from "chart.js";
import { Bubble } from "react-chartjs-2";
import { chartsApi } from "@/lib/api/chartsApi";
import { ScoreDataPoint, ChartPeriod } from "@/types/habits";
import ChartCard from "./ChartCard";

ChartJS.register(LinearScale, PointElement, Tooltip, Legend, Title);

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

  const chartData = useMemo(() => {
    return {
      datasets: [
        {
          label: "Score",
          data: data.map((point) => ({
            x: new Date(point.date).getTime(),
            y: point.score,
            r: 8, // Fixed radius for bubbles
            rawDate: point.date, // Store original date for tooltip
            label: point.label,
          })),
          backgroundColor: "rgba(34, 197, 94, 0.6)", // green-500 with opacity
          borderColor: "rgba(34, 197, 94, 1)", // green-500
          borderWidth: 1,
        },
      ],
    };
  }, [data]);

  const options: ChartOptions<"bubble"> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const raw = context.raw;
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
      subtitle="Your consistency score"
      loading={loading}
      error={error || undefined}
    >
      <div className="h-[320px] w-full p-4">
        <Bubble data={chartData} options={options} />
      </div>
    </ChartCard>
  );
}
