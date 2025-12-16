"use client";

import { useState } from "react";

interface HabitHeatmapProps {
  habitId: string;
}

export default function HabitHeatmap({ habitId }: HabitHeatmapProps) {
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [hoveredPosition, setHoveredPosition] = useState({ x: 0, y: 0 });

  // Fetch data from API
  const { data, isLoading, error } = useHabitData(habitId);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-1">Habit Heatmap</h2>
      <p className="text-gray-600">
        Visualize your habit completions over the past 90 days
      </p>

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
