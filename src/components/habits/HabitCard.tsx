import { Habit, LogCompletionType } from "@/types/habits";
import { Weather } from "@/types/weather";
import {
  Check,
  Clock,
  Flame,
  Calendar,
  AlertCircle,
  Trash2,
  MoreVertical,
  SkipForward,
} from "lucide-react";
import { useState } from "react";

interface HabitCardProps {
  habit: Habit;
  onComplete: (id: string) => void;
  onSkip: (id: string) => void;
  onDelete: (id: string) => void;
  weather: Weather | null;
}

export default function HabitCard({
  habit,
  onComplete,
  onSkip,
  onDelete,
  weather,
}: HabitCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  // Check if completed today
  const isCompleted =
    habit.logs?.some((l) => l.status === LogCompletionType.COMPLETED) || false;

  const isSkipped =
    habit.logs?.some((l) => l.status === LogCompletionType.SKIPPED) || false;

  // Check if weather is bad for outdoor habits
  const isWeatherBad =
    habit.isWeatherDependent &&
    weather &&
    (weather.condition === "Rain" || weather.temp > 35 || weather.temp < 10);

  // Get streak emoji
  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return "🔥🔥🔥";
    if (streak >= 14) return "🔥🔥";
    if (streak >= 7) return "🔥";
    if (streak >= 3) return "⭐";
    return "✨";
  };

  return (
    <div
      className="bg-white rounded-xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 relative overflow-hidden group"
      style={{
        borderTopColor: habit.color,
        borderTopWidth: "4px",
      }}
    >
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-5 transform translate-x-8 -translate-y-8 transition-transform group-hover:scale-110">
        <div className="text-8xl">{habit.icon}</div>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-4 relative">
        <div className="flex items-center gap-3 flex-1">
          {/* Icon */}
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shadow-md transition-transform group-hover:scale-110"
            style={{
              backgroundColor: habit.color + "25",
              border: `2px solid ${habit.color}40`,
            }}
          >
            {habit.icon}
          </div>

          {/* Title & Time */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-lg truncate">
              {habit.name}
            </h3>
            {habit.scheduledTime && (
              <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                <Clock className="w-4 h-4" />
                <span>{habit.scheduledTime}</span>
              </div>
            )}
          </div>
        </div>

        {/* More Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-gray-500" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-10 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[140px] z-20">
                {!isCompleted && !isSkipped && (
                  <button
                    onClick={() => {
                      onSkip(habit.id);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <SkipForward className="w-4 h-4" />
                    Skip Today
                  </button>
                )}
                <button
                  onClick={() => {
                    onDelete(habit.id);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Description */}
      {habit.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {habit.description}
        </p>
      )}

      {/* Weather Warning */}
      {isWeatherBad && !isCompleted && !isSkipped && (
        <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg mb-4">
          <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0" />
          <span className="text-xs text-orange-700">
            Weather not ideal today ({weather?.condition}, {weather?.temp}°C)
          </span>
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="text-lg font-bold text-gray-900">
              {habit.currentStreak}
            </span>
          </div>
          <span className="text-sm text-gray-600">
            day{habit.currentStreak !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="w-px h-6 bg-gray-200" />

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-gray-700">
            {habit.totalCompletions} total
          </span>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={() => !isCompleted && !isSkipped && onComplete(habit.id)}
        disabled={isCompleted || isSkipped}
        className={`w-full py-3.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
          isCompleted
            ? "bg-green-50 text-green-700 border-2 border-green-200 cursor-not-allowed"
            : isSkipped
            ? "bg-gray-50 text-gray-500 border-2 border-gray-200 cursor-not-allowed"
            : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
        }`}
      >
        {isCompleted ? (
          <>
            <Check className="w-5 h-5" />
            <span>Completed Today! {getStreakEmoji(habit.currentStreak)}</span>
          </>
        ) : isSkipped ? (
          <>
            <SkipForward className="w-5 h-5" />
            <span>Skipped Today</span>
          </>
        ) : (
          <>
            <Check className="w-5 h-5" />
            <span>Mark as Complete</span>
          </>
        )}
      </button>

      {/* Completed/Skipped Badge */}
      {(isCompleted || isSkipped) && (
        <div
          className={`absolute top-4 right-14 text-xs font-bold px-2 py-1 rounded-full ${
            isCompleted
              ? "bg-green-500 text-white"
              : "bg-gray-200 text-gray-600"
          }`}
        >
          {isCompleted ? "✓ Done" : "⏭ Skipped"}
        </div>
      )}
    </div>
  );
}
