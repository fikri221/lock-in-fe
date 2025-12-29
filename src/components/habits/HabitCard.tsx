import { Habit, LogCompletionType } from "@/types/habits";
import { Weather } from "@/types/weather";
import {
  Check,
  Clock,
  Flame,
  AlertCircle,
  Trash2,
  MoreVertical,
  SkipForward,
  SkipBack,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface HabitCardProps {
  habit: Habit;
  onComplete: (id: string) => void;
  onSkip: (id: string) => void;
  onDelete: (id: string) => void;
  onCancel: (id: string) => void;
  weather: Weather | null;
}

export default function HabitCard({
  habit,
  onComplete,
  onSkip,
  onDelete,
  onCancel,
  weather,
}: HabitCardProps) {
  const router = useRouter();
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

  // Navigate to detail page when card is clicked
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on buttons or menu
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest(".menu-trigger")) {
      return;
    }
    router.push(`/habits/${habit.id}`);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCompleted) {
      onCancel(habit.id);
    } else {
      onComplete(habit.id);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`relative mb-4 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 border group overflow-visible ${
        isCompleted
          ? "bg-green-50 border-green-200"
          : "bg-white border-gray-100"
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Left: Circular Progress & Icon */}
        <div className="relative flex-shrink-0">
          {/* Progress Ring */}
          <div className="relative w-16 h-16">
            <svg className="w-full h-full transform -rotate-90">
              {/* Background Ring */}
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                className={isCompleted ? "text-green-200" : "text-gray-100"}
              />
              {/* Progress Ring */}
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                className={`transition-all duration-500 ease-out ${
                  isCompleted ? "text-green-500" : "text-transparent"
                }`}
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={isCompleted ? "0" : `${2 * Math.PI * 28}`}
              />
            </svg>

            {/* Icon Center */}
            <div
              className={`absolute inset-0 m-auto w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all duration-300 ${
                isCompleted
                  ? "bg-green-500 text-white"
                  : "bg-gray-50 text-gray-700"
              }`}
              style={
                !isCompleted
                  ? { backgroundColor: habit.color + "20", color: habit.color }
                  : {}
              }
            >
              {habit.icon}
            </div>
          </div>
        </div>

        {/* Middle: Info */}
        <div className="flex-1 min-w-0">
          <h3
            className={`font-bold text-gray-900 text-lg truncate ${
              isCompleted ? "line-through text-gray-400" : ""
            }`}
          >
            {habit.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-medium text-gray-500">
              {habit.category}
            </span>
            {habit.scheduledTime && (
              <>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  <Clock className="w-3 h-3" />
                  {habit.scheduledTime}
                </span>
              </>
            )}
            {isSkipped && (
              <span className="text-xs font-medium text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">
                Skipped
              </span>
            )}
          </div>
        </div>

        {/* Right: Streak & Action */}
        <div className="flex items-center gap-4">
          {/* Streak */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Streak
            </span>
            <div className="flex items-center gap-1">
              <Flame
                className={`w-4 h-4 ${
                  habit.currentStreak > 0
                    ? "text-orange-500 fill-orange-500"
                    : "text-gray-300"
                }`}
              />
              <span
                className={`font-bold ${
                  habit.currentStreak > 0 ? "text-gray-900" : "text-gray-400"
                }`}
              >
                {habit.currentStreak}
              </span>
            </div>
          </div>

          {/* New Checkbox/Toggle Button */}
          <button
            onClick={handleToggle}
            className={`
              w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
              ${
                isCompleted
                  ? "bg-green-500 text-white shadow-lg scale-105"
                  : "bg-gray-100 text-gray-300 hover:bg-gray-200 hover:scale-105"
              }
            `}
          >
            {isCompleted ? (
              <Check className="w-6 h-6" />
            ) : isSkipped ? (
              <SkipForward className="w-6 h-6" />
            ) : (
              <div className="w-full h-full rounded-full border-2 border-gray-300" />
            )}
          </button>
        </div>
      </div>

      {/* Menu Button (Absolute Top Right) */}
      <div className="absolute top-2 right-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="p-1 rounded-full hover:bg-gray-100 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(false);
              }}
            />
            <div className="absolute right-0 top-6 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[140px] z-20">
              {!isCompleted && !isSkipped && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSkip(habit.id);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <SkipForward className="w-4 h-4" />
                  Skip Today
                </button>
              )}
              {isSkipped && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCancel(habit.id);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <SkipBack className="w-4 h-4" />
                  Cancel Skip
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
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

      {/* Description / Weather Warning - Optional Footer */}
      {isWeatherBad && !isCompleted && (
        <div className="mt-3 text-xs text-orange-600 bg-orange-50 px-3 py-2 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-3 h-3" />
          <span>Weather warning: {weather?.condition}</span>
        </div>
      )}
    </div>
  );
}
