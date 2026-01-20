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
  onComplete: (
    id: string,
    data?: { actualValue?: number; logDate: Date },
  ) => void;
  onSkip: (id: string, data?: { logDate: Date }) => void;
  onDelete: (id: string) => void;
  onCancel: (
    id: string,
    data?: { cancelledReason?: string; logDate: Date },
  ) => void;
  weather: Weather | null;
  date?: Date;
}

export default function HabitCard({
  habit,
  onComplete,
  onSkip,
  onDelete,
  onCancel,
  weather,
  date = new Date(),
}: HabitCardProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [showProgressInput, setShowProgressInput] = useState(false);
  const [progressValue, setProgressValue] = useState<string>("");

  // Check if completed today
  const isCompleted =
    habit.logs?.some((l) => {
      return (
        l.status === LogCompletionType.COMPLETED &&
        new Date(l.logDate || "").toDateString() === date.toDateString()
      );
    }) || false;

  const isSkipped =
    habit.logs?.some(
      (l) =>
        l.status === LogCompletionType.SKIPPED &&
        new Date(l.logDate || "").toDateString() === date.toDateString(),
    ) || false;

  // Check if weather is bad for outdoor habits
  const isWeatherBad =
    habit.isWeatherDependent &&
    weather &&
    (weather.condition === "Rain" || weather.temp > 35 || weather.temp < 10);

  // Calculate progress percentage
  let progressPercentage = 0;
  if ((habit.targetValue || 0) > 0) {
    // For measurable habits
    // Find today's log to get the actual value
    // use filter to get the latest log
    const latestLog =
      habit.logs
        ?.filter(
          (l) =>
            new Date(l.logDate || "").toDateString() === date.toDateString(),
        )
        .pop() || habit.logs?.[habit.logs.length - 1]; // Fallback to last log if date check fails or for immediate update

    const currentValue = latestLog?.actualValue || 0;
    progressPercentage = Math.min(
      100,
      (currentValue / (habit.targetValue || 1)) * 100,
    );

    // If usage status is CANCELLED or SKIPPED, treat as 0 progress
    if (
      (latestLog?.status === LogCompletionType.CANCELLED &&
        new Date(latestLog?.logDate || "").toDateString() ===
          date.toString().substring(0, 15)) ||
      (latestLog?.status === LogCompletionType.SKIPPED &&
        new Date(latestLog?.logDate || "").toDateString() ===
          date.toString().substring(0, 15)) ||
      !isCompleted
    ) {
      progressPercentage = 0;
    }

    // Override if status is explicitly COMPLETED (full circle)
  } else {
    // For boolean habits
    progressPercentage = isCompleted ? 100 : 0;
  }

  const circumference = 2 * Math.PI * 28;
  const strokeDashoffset =
    circumference - (progressPercentage / 100) * circumference;

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
      onCancel(habit.id, { cancelledReason: "", logDate: date });
    } else {
      // Check if habit is measurable
      if ((habit.targetValue || 0) > 0) {
        // Initialize with target value if empty
        if (!progressValue) {
          setProgressValue(habit.targetValue?.toString() || "");
        }
        setShowProgressInput(true);
      } else {
        onComplete(habit.id, { logDate: date });
      }
    }
  };

  const submitProgress = (e: React.MouseEvent) => {
    e.stopPropagation();
    const value = parseFloat(progressValue);
    if (!isNaN(value)) {
      onComplete(habit.id, { actualValue: value, logDate: date });
      setShowProgressInput(false);
    }
  };

  const handleInputClick = (e: React.MouseEvent) => {
    e.stopPropagation();
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
                  progressPercentage > 0 ? "text-green-500" : "text-transparent"
                }`}
                strokeDasharray={`${circumference}`}
                strokeDashoffset={`${strokeDashoffset}`}
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
                  {habit.scheduledTime?.slice(0, 5)}
                </span>
              </>
            )}
            {isSkipped && !isCompleted && (
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

        {/* Measurement Input Popover */}
        {showProgressInput && (
          <>
            <div
              className="fixed inset-0 z-20"
              onClick={(e) => {
                e.stopPropagation();
                setShowProgressInput(false);
              }}
            />
            <div
              className="absolute right-0 top-16 z-30 bg-white rounded-xl shadow-xl border border-gray-200 p-4 min-w-[200px] animate-in fade-in zoom-in-95 duration-200"
              onClick={handleInputClick}
            >
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    Log Progress
                  </span>
                  <span className="text-xs text-gray-500">
                    Target: {habit.targetValue} {habit.targetUnit}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={progressValue}
                    onChange={(e) => setProgressValue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="Value"
                    autoFocus
                  />
                  <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
                    {habit.targetUnit}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowProgressInput(false)}
                    className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitProgress}
                    className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
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
                    onSkip(habit.id, { logDate: date });
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
