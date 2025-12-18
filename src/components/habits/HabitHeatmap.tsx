"use client";

import { useState, useMemo } from "react";
import { format, subDays, startOfDay, getDay } from "date-fns";

interface HabitHeatmapProps {
  habitId: string;
}

export default function HabitHeatmap({ habitId }: HabitHeatmapProps) {
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [hoveredPosition, setHoveredPosition] = useState({ x: 0, y: 0 });

  // Generate 90 days of data
  const data = useMemo(() => {
    const data: { [key: string]: number } = {};
    const today = startOfDay(new Date());

    for (let i = 89; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, "yyyy-MM-dd");
      // Mock: 70% completion rate
      data[dateStr] = Math.random() > 0.3 ? 1 : 0;
    }

    return data;
  }, []);

  const today = startOfDay(new Date());

  // Get intensity color
  const getColor = (value: number) => {
    if (value === 0) return "bg-gray-200";
    return "bg-green-500";
  };

  // Generate grid (7 rows for days of week, columns for weeks)
  const grid = useMemo(() => {
    const grid: string[][] = Array(7)
      .fill(null)
      .map(() => []);

    for (let i = 89; i >= 0; i--) {
      const date = subDays(today, i);
      const dayOfWeek = getDay(date);
      const dateStr = format(date, "yyyy-MM-dd");
      grid[dayOfWeek].push(dateStr);
    }

    return grid;
  }, [today]);
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Activity Calendar (Last 90 Days)
      </h2>

      <div className="flex gap-2">
        {/* Day labels */}
        <div className="flex flex-col gap-1 pt-5">
          {dayLabels.map((day, i) => (
            <div
              key={day}
              className="h-3 text-xs text-gray-500 flex items-center"
            >
              {i % 2 === 0 && day}
            </div>
          ))}
        </div>

        {/* Heatmap grid */}
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-1">
            {grid[0].map((_, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {grid.map((week, dayIndex) => {
                  const dateStr = week[weekIndex];
                  if (!dateStr)
                    return <div key={dayIndex} className="w-3 h-3" />;

                  const value = data[dateStr] || 0;

                  return (
                    <div
                      key={dateStr}
                      className={`w-3 h-3 rounded-sm ${getColor(
                        value
                      )} hover:ring-2 hover:ring-blue-500 cursor-pointer transition-all`}
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
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-4 text-xs text-gray-600">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 bg-gray-200 rounded-sm" />
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
          <p className="text-xs text-gray-300">
            {data[hoveredDate] === 1 ? "✓ Completed" : "✗ Not completed"}
          </p>
        </div>
      )}
    </div>
  );
}
