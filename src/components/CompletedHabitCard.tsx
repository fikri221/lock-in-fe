import {
  CompletionRecord,
  HabitCompletionType,
  HabitTrackerProps,
} from "@/types/habits";
import React from "react";

interface CompletedHabitCardProps {
  habit: HabitTrackerProps;
  habits: HabitTrackerProps[];
  setHabits: (data: HabitTrackerProps[]) => void;
  saveData: (data: HabitTrackerProps[]) => void;
  getCompletionIcon: (type: HabitCompletionType) => React.JSX.Element;
  completion: CompletionRecord;
  today: string;
}

export default function CompletedHabitCard({
  habit,
  habits,
  setHabits,
  saveData,
  getCompletionIcon,
  completion,
  today,
}: CompletedHabitCardProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        {getCompletionIcon(completion?.type)}
        <span className="font-medium text-gray-700">
          {completion?.type === HabitCompletionType.FULL
            ? "✅ Selesai!"
            : completion?.type === HabitCompletionType.PARTIAL
            ? "⚡ Partial - Tetap bagus!"
            : "⏭️ Di-skip"}
        </span>
      </div>
      {completion?.duration && (
        <p className="text-sm text-gray-600">
          Durasi: {completion.duration} menit
        </p>
      )}
      {completion?.reason && completion?.type === HabitCompletionType.SKIP && (
        <p className="text-sm text-gray-600">Alasan: {completion.reason}</p>
      )}
      <button
        onClick={() => {
          const updatedHabits = habits.map((h) => {
            if (h.id === habit.id) {
              const completions = { ...h.completions };
              delete completions[today];
              return { ...h, completions };
            }
            return h;
          });
          setHabits(updatedHabits);
          saveData(updatedHabits);
        }}
        className="text-sm text-indigo-600 hover:text-indigo-700 mt-2"
      >
        Ubah status
      </button>
    </div>
  );
}
