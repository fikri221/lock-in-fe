"use client";

import { useEffect, useState, useMemo } from "react";
import ChartCard from "./ChartCard";
import { chartsApi } from "@/lib/api/chartsApi";
import { FrequencyDataPoint } from "@/types/habits";

interface FrequencyChartProps {
  habitId: string;
}

export default function FrequencyChart({ habitId }: FrequencyChartProps) {
  const [data, setData] = useState<FrequencyDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<FrequencyDataPoint | null>(
    null,
  );
  const [hoveredPosition, setHoveredPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const chartData = await chartsApi.getFrequencyChart(habitId);
        setData(chartData);
        setError(null);
      } catch (err: any) {
        setError(
          err?.response?.data?.message || "Failed to load frequency data",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [habitId]);

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthLabels = [
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
    "Jan",
  ];

  // Calculate bubble size
  const { maxValue, dataMap } = useMemo(() => {
    const maxValue = Math.max(...data.map((d) => d.value), 1);
    const map: { [key: string]: number } = {};
    data.forEach((point) => {
      map[`${point.month}-${point.day}`] = point.value;
    });
    return { maxValue, dataMap: map };
  }, [data]);

  const getBubbleSize = (value: number) => {
    const percentage = (value / maxValue) * 100;
    if (percentage >= 75) return 32; // 2rem
    if (percentage >= 50) return 24; // 1.5rem
    if (percentage >= 25) return 16; // 1rem
    return 12; // 0.75rem
  };

  const getBubbleOpacity = (value: number) => {
    const percentage = (value / maxValue) * 100;
    if (percentage >= 75) return "opacity-100";
    if (percentage >= 50) return "opacity-75";
    if (percentage >= 25) return "opacity-50";
    return "opacity-30";
  };

  return (
    <ChartCard
      title="Frequency"
      subtitle="Activity pattern by day and month"
      loading={loading}
      error={error || undefined}
      className="lg:col-span-2"
    >
      {data.length > 0 && (
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Grid */}
            <div className="flex gap-4">
              {/* Day labels */}
              <div className="flex flex-col justify-around py-8">
                {dayLabels.map((day) => (
                  <div
                    key={day}
                    className="text-sm font-medium text-gray-600 h-12 flex items-center"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Grid cells */}
              <div className="flex-1 grid grid-cols-12 gap-2">
                {monthLabels.map((month, monthIdx) => (
                  <div key={month} className="flex flex-col gap-2">
                    {/* Month header */}
                    <div className="text-xs font-medium text-gray-600 text-center h-8 flex items-center justify-center">
                      {month}
                    </div>

                    {/* Days column */}
                    {dayLabels.map((_, dayIdx) => {
                      const key = `${monthIdx}-${dayIdx}`;
                      const value = dataMap[key] || 0;

                      return (
                        <div
                          key={key}
                          className="h-12 flex items-center justify-center relative"
                        >
                          {value > 0 && (
                            <div
                              className={`bg-green-500 rounded-full transition-all hover:scale-110 cursor-pointer ${getBubbleOpacity(value)}`}
                              style={{
                                width: `${getBubbleSize(value)}px`,
                                height: `${getBubbleSize(value)}px`,
                              }}
                              onMouseEnter={(e) => {
                                setHoveredPoint({
                                  month: monthIdx,
                                  day: dayIdx,
                                  value,
                                });
                                setHoveredPosition({
                                  x: e.clientX,
                                  y: e.clientY,
                                });
                              }}
                              onMouseLeave={() => setHoveredPoint(null)}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Tooltip */}
            {hoveredPoint && (
              <div
                className="fixed z-50 bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm pointer-events-none"
                style={{
                  left: hoveredPosition.x + 10,
                  top: hoveredPosition.y + 10,
                }}
              >
                <p className="font-semibold">
                  {monthLabels[hoveredPoint.month]} -{" "}
                  {dayLabels[hoveredPoint.day]}
                </p>
                <p className="text-xs text-green-300 mt-1">
                  Count: {hoveredPoint.value}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </ChartCard>
  );
}
