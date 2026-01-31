"use client";

import { useEffect, useState, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  subMonths,
  getDay,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import ChartCard from "./ChartCard";
import { chartsApi } from "@/lib/api/chartsApi";
import { CalendarChartResponse } from "@/types/habits";
import { isAxiosError } from "@/utils/errorHandlers";

import { useResizeObserver } from "@/hooks/useResizeObserver";

interface CalendarChartProps {
  habitId: string;
  months?: number; // Initial/fallback months
}

export default function CalendarChart({
  habitId,
  months: initialMonths = 3,
}: CalendarChartProps) {
  const { ref, width } = useResizeObserver<HTMLDivElement>();
  const [months, setMonths] = useState(initialMonths);

  // Update months based on width
  useEffect(() => {
    if (width > 0) {
      // 24px per week column (16px cell + 8px gap)
      // Approx 4.35 weeks per month
      // 40px left padding/offset
      const STRIDE = 24;
      const OFFSET = 40;
      const availableWidth = width - OFFSET;
      const weeksFit = Math.floor(availableWidth / STRIDE);
      const calculatedMonths = Math.max(1, Math.floor(weeksFit / 4.35));

      // Only update if significantly different to avoid jitter (optional, but good practice)
      // limiting to max 12 months for sanity
      const boundedMonths = Math.min(12, calculatedMonths);

      if (boundedMonths !== months) {
        setMonths(boundedMonths);
      }
    }
  }, [width, months]);

  const [calendarData, setCalendarData] = useState<CalendarChartResponse>({
    success: true,
    data: [],
    targetValue: 0,
  });
  const { data, targetValue } = calendarData;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [hoveredPosition, setHoveredPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Use the dynamic months state here
        const chartData = await chartsApi.getCalendarChart(habitId, months);
        setCalendarData(chartData);
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

    // Debounce fetching to prevent spamming while resizing
    const timeoutId = setTimeout(fetchData, 300);
    return () => clearTimeout(timeoutId);
  }, [habitId, months]);

  // Convert array to date map
  const dataMap = useMemo(() => {
    const map: { [key: string]: number } = {};
    data.forEach((item) => {
      map[item.date] = item.actualValue;
    });
    return map;
  }, [data]);

  // Get color intensity based on value
  const getColor = (value: number | undefined) => {
    if (!value || value === 0) return "bg-gray-200";

    // Determine intensity levels (adjust thresholds as needed)
    const percentage = (value / targetValue) * 100;

    if (percentage >= 75) return "bg-green-600";
    if (percentage >= 50) return "bg-green-400";
    if (percentage >= 25) return "bg-green-200";
    return "bg-green-200";
  };

  const { grid, monthHeaders } = useMemo(() => {
    const today = new Date();
    // 1. Determine the full range of actual data/display
    const rangeStart = startOfMonth(subMonths(today, months - 1));
    const rangeEnd = endOfMonth(today);

    // 2. Pad to full weeks to ensure grid alignment
    const calendarStart = startOfWeek(rangeStart);
    const calendarEnd = endOfWeek(rangeEnd);

    const grid: string[][] = Array(7)
      .fill(null)
      .map(() => []);
    const monthHeaders: { month: string; weekIndex: number }[] = [];

    const allDays = eachDayOfInterval({
      start: calendarStart,
      end: calendarEnd,
    });

    allDays.forEach((day) => {
      const dayOfWeek = getDay(day);
      const dateStr = format(day, "yyyy-MM-dd");
      grid[dayOfWeek].push(dateStr);

      if (day.getDate() === 1) {
        // grid[0].length is current column index (0-based) because:
        // - We push to grid columns day by day.
        // - For a given week column, Sunday (index 0) is pushed first.
        // - so grid[0].length increases at the start of every week.
        // - When we process any day in that week, grid[0].length is already N.
        // - The index of that week is N-1.
        monthHeaders.push({
          month: format(day, "MMM yyyy"),
          weekIndex: grid[0].length - 1,
        });
      }
    });

    return { grid, monthHeaders };
  }, [months]);

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Styling constants
  const CELL_SIZE = "w-4 h-4"; // 16px
  const GAP_CLASS = "gap-2"; // 8px
  const STRIDE = 24; // 16 + 8
  const OFFSET = 40; // 32 (w-8) + 8 (gap-2)

  return (
    <ChartCard
      title="Calendar"
      subtitle="Completion heatmap"
      loading={loading}
      error={error || undefined}
    >
      <div ref={ref} className="w-full">
        {data.length > 0 && (
          <div className="overflow-x-auto pb-2">
            {/* Month headers - Absolute positioning for precision */}
            <div
              className="relative h-6 mb-2"
              style={{ minWidth: "max-content" }}
            >
              {monthHeaders.map((header, idx) => (
                <div
                  key={idx}
                  className="absolute text-xs font-medium text-gray-600 whitespace-nowrap"
                  style={{
                    left: `${OFFSET + header.weekIndex * STRIDE}px`,
                  }}
                >
                  {header.month}
                </div>
              ))}
            </div>

            <div
              className={`flex ${GAP_CLASS}`}
              style={{ minWidth: "max-content" }}
            >
              {/* Day labels */}
              <div className={`flex flex-col ${GAP_CLASS} pt-[1px]`}>
                {dayLabels.map((day, i) => (
                  <div
                    key={day}
                    className={`h-4 text-xs text-gray-500 flex items-center w-8 justify-end`}
                  >
                    {i % 2 === 0 && day}
                  </div>
                ))}
              </div>

              {/* Heatmap grid */}
              <div className={`flex ${GAP_CLASS}`}>
                {grid[0].map((_, weekIndex) => (
                  <div key={weekIndex} className={`flex flex-col ${GAP_CLASS}`}>
                    {grid.map((week, dayIndex) => {
                      const dateStr = week[weekIndex];
                      if (!dateStr)
                        return <div key={dayIndex} className={CELL_SIZE} />;

                      const value = dataMap[dateStr];

                      return (
                        <div
                          key={dateStr}
                          className={`${CELL_SIZE} rounded-sm ${getColor(value)} hover:ring-2 hover:ring-blue-500 cursor-pointer transition-all`}
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
            <div className="flex items-center gap-2 mt-6 text-xs text-gray-600 pl-10">
              <span>Less</span>
              <div className={`flex ${GAP_CLASS}`}>
                <div className={`${CELL_SIZE} bg-gray-200 rounded-sm`} />
                <div className={`${CELL_SIZE} bg-green-200 rounded-sm`} />
                <div className={`${CELL_SIZE} bg-green-400 rounded-sm`} />
                <div className={`${CELL_SIZE} bg-green-600 rounded-sm`} />
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
      </div>
    </ChartCard>
  );
}
