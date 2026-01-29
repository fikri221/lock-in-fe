"use client";

import { useEffect, useState, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  subMonths,
  getDay,
} from "date-fns";
import ChartCard from "./ChartCard";
import { chartsApi } from "@/lib/api/chartsApi";
import { CalendarDataPoint } from "@/types/habits";
import { isAxiosError } from "@/utils/errorHandlers";

interface CalendarChartProps {
  habitId: string;
  months?: number;
}

export default function CalendarChart({
  habitId,
  months = 3,
}: CalendarChartProps) {
  const [data, setData] = useState<CalendarDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [hoveredPosition, setHoveredPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const chartData = await chartsApi.getCalendarChart(habitId, months);
        setData(chartData);
        setError(null);
      } catch (err: unknown) {
        if (isAxiosError(err)) {
          setError(err.response?.data?.error || "Failed to load calendar data");
        } else if (err instanceof Error) {
          setError(err.message || "Failed to load calendar data");
        } else {
          setError("Failed to load calendar data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [habitId, months]);

  // Convert array to date map
  const dataMap = useMemo(() => {
    const map: { [key: string]: number } = {};
    data.forEach((item) => {
      map[item.date] = item.value;
      console.log("item: ", item.date);
    });
    console.log("map: ", map);
    return map;
  }, [data]);

  // Get color intensity based on value
  const getColor = (value: number | undefined) => {
    if (!value || value === 0) return "bg-gray-200";

    // Determine intensity levels (adjust thresholds as needed)
    const maxValue = Math.max(...data.map((d) => d.value));
    const percentage = (value / maxValue) * 100;

    if (percentage >= 75) return "bg-green-500";
    if (percentage >= 50) return "bg-green-400";
    if (percentage >= 25) return "bg-green-300";
    return "bg-green-200";
  };

  // Generate calendar grid
  const { grid, monthHeaders } = useMemo(() => {
    const today = new Date();
    const grid: string[][] = Array(7)
      .fill(null)
      .map(() => []);
    const monthHeaders: { month: string; weekIndex: number }[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const monthDate = subMonths(today, i);
      const start = startOfMonth(monthDate);
      const end = endOfMonth(monthDate);
      const days = eachDayOfInterval({ start, end });

      const firstDayOfMonth = days[0];
      const weekIndexOfFirstDay = grid[0].length;

      monthHeaders.push({
        month: format(monthDate, "MMM yyyy"),
        weekIndex: weekIndexOfFirstDay,
      });

      days.forEach((day) => {
        const dayOfWeek = getDay(day); // 0 = Sunday
        const dateStr = format(day, "yyyy-MM-dd");
        grid[dayOfWeek].push(dateStr);
      });
    }

    return { grid, monthHeaders };
  }, [months]);

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <ChartCard
      title="Calendar"
      subtitle="Completion heatmap"
      loading={loading}
      error={error || undefined}
    >
      {data.length > 0 && (
        <div className="overflow-x-auto">
          {/* Month headers */}
          <div className="flex gap-1 mb-2 pl-12">
            {monthHeaders.map((header, idx) => (
              <div
                key={idx}
                className="text-xs font-medium text-gray-600"
                style={{
                  marginLeft: idx === 0 ? 0 : `${header.weekIndex * 14}px`,
                }}
              >
                {header.month}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            {/* Day labels */}
            <div className="flex flex-col gap-1">
              {dayLabels.map((day, i) => (
                <div
                  key={day}
                  className="h-3 text-xs text-gray-500 flex items-center w-8"
                >
                  {i % 2 === 0 && day}
                </div>
              ))}
            </div>

            {/* Heatmap grid */}
            <div className="flex gap-1">
              {grid[0].map((_, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {grid.map((week, dayIndex) => {
                    const dateStr = week[weekIndex];
                    if (!dateStr)
                      return <div key={dayIndex} className="w-3 h-3" />;

                    const value = dataMap[dateStr];

                    return (
                      <div
                        key={dateStr}
                        className={`w-3 h-3 rounded-sm ${getColor(value)} hover:ring-2 hover:ring-blue-500 cursor-pointer transition-all`}
                        onMouseEnter={(e) => {
                          setHoveredDate(dateStr);
                          setHoveredPosition({ x: e.clientX, y: e.clientY });
                        }}
                        onMouseLeave={() => setHoveredDate(null)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mt-4 text-xs text-gray-600">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 bg-gray-200 rounded-sm" />
              <div className="w-3 h-3 bg-green-200 rounded-sm" />
              <div className="w-3 h-3 bg-green-300 rounded-sm" />
              <div className="w-3 h-3 bg-green-400 rounded-sm" />
              <div className="w-3 h-3 bg-green-500 rounded-sm" />
            </div>
            <span>More</span>
          </div>

          {/* Tooltip */}
          {hoveredDate && (
            <div
              className="fixed z-50 bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm pointer-events-none"
              style={{
                left: hoveredPosition.x + 10,
                top: hoveredPosition.y + 10,
              }}
            >
              <p className="font-semibold">
                {format(new Date(hoveredDate), "MMM dd, yyyy")}
              </p>
              <p className="text-xs text-green-300 mt-1">
                Value: {dataMap[hoveredDate] || 0}
              </p>
            </div>
          )}
        </div>
      )}
    </ChartCard>
  );
}
