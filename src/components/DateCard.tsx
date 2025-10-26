import { HabitCompletionType, HabitTrackerProps } from "@/types/habits";
import React from "react";

interface DateCardProps {
  habit: HabitTrackerProps;
  getCompletionIcon: (type?: HabitCompletionType) => React.JSX.Element;
}

export default function DateCard({ habit, getCompletionIcon }: DateCardProps) {
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push({
        date: date.toISOString().split("T")[0],
        dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
        dayNum: date.getDate(),
      });
    }
    return days;
  };

  const last7Days = getLast7Days();

  return (
    <div key={habit.id} className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">{habit.name}</h3>

      <div className="grid grid-cols-7 gap-2">
        {last7Days.map((day) => {
          const completion = habit.completions[day.date];

          return (
            <div key={day.date} className="text-center">
              <div className="text-xs text-gray-500 mb-1">{day.dayName}</div>
              <div className="text-xs text-gray-400 mb-2">{day.dayNum}</div>
              <div className="flex justify-center">
                {getCompletionIcon(completion?.type)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
