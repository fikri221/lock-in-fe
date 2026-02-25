// frontend/src/app/(dashboard)/habits/[id]/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Edit2,
  Trash2,
  Download,
  MoreVertical,
  Flame,
  Clock,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { useHabits } from "@/hooks/useHabits";
import { LogCompletion, LogCompletionType } from "@/types/habits";
import { HabitCharts } from "@/components/charts";

export default function HabitDetailPage() {
  const router = useRouter();
  const params = useParams();
  const habitId = params.id as string;

  const { habits, loading, deleteHabit, updateHabit, completeHabit } =
    useHabits(new Date().toDateString());

  // Derive habit directly instead of using local state to avoid infinite loops
  const habit = useMemo(
    () => habits.find((h) => h.id === habitId),
    [habits, habitId],
  );

  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedTime, setEditedTime] = useState<string | undefined>(undefined);

  // Handle habit not found and form initialization
  useEffect(() => {
    if (!loading) {
      if (!habit) {
        toast.error("Habit not found");
        router.push("/");
      } else if (!isEditing) {
        // Initialize form state when habit loads/changes, but only if not currently editing
        // Only update state if values are actually different to prevent infinite loops
        if (editedName !== habit.name) setEditedName(habit.name);
        if (editedDescription !== (habit.description || ""))
          setEditedDescription(habit.description || "");
        if (editedTime !== (habit.scheduledTime?.slice(0, 5) || undefined))
          setEditedTime(habit.scheduledTime?.slice(0, 5) || undefined);
      }
    }
  }, [
    habit,
    loading,
    router,
    isEditing,
    editedName,
    editedDescription,
    editedTime,
  ]);

  const handleComplete = async () => {
    try {
      await completeHabit(habitId, {
        status: LogCompletionType.COMPLETED,
      });
      toast.success("Habit completed! 🎉");
    } catch (error) {
      console.error("Error completing habit:", error);
    }
  };

  const handleDelete = async () => {
    if (
      confirm(
        "Are you sure you want to delete this habit? This cannot be undone.",
      )
    ) {
      try {
        await deleteHabit(habitId);
        toast.success("Habit deleted");
        router.push("/");
      } catch (error) {
        console.error("Error deleting habit:", error);
      }
    }
  };

  const handleSaveEdit = async () => {
    try {
      await updateHabit(habitId, {
        name: editedName,
        description: editedDescription,
        scheduledTime: editedTime,
      });
      setIsEditing(false);
      toast.success("Habit updated!");
    } catch (error) {
      console.error("Error updating habit:", error);
    }
  };

  const handleExport = () => {
    // TODO: Implement CSV export
    toast.info("Export feature coming soon!");
  };

  const isCompleted = habit?.logs?.some(
    (l: LogCompletion) => l.status === LogCompletionType.COMPLETED,
  );

  if (loading || !habit) {
    return (
      <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950 items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-zinc-300 dark:border-zinc-700 border-t-zinc-900 dark:border-t-zinc-100 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">
            Loading details...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/80 px-3 sm:px-4 py-3 sm:py-4 backdrop-blur-lg dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto max-w-lg flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 p-1.5 -ml-1.5 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`p-2 rounded-full transition-colors ${
                isEditing
                  ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                  : "hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:text-zinc-500 dark:hover:text-zinc-300"
              }`}
            >
              <Edit2 className="w-4 h-4" />
            </button>

            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 py-1 z-30 overflow-hidden text-sm font-medium">
                    <button
                      onClick={() => {
                        handleExport();
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 flex items-center gap-3 text-zinc-700 dark:text-zinc-300 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Export CSV
                    </button>
                    <button
                      onClick={() => {
                        handleDelete();
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-3 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Habit
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-lg flex-1 px-3 sm:px-4 py-6 sm:py-8 relative">
        {/* Habit Identity */}
        <div className="flex flex-col items-center text-center mb-8">
          {/* Identity Graphics */}
          {!isEditing && habit.habitType === "measurable" ? (
            <div className="relative mb-6">
              {/* Circular Progress Bar */}
              <svg className="w-36 h-36 transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="64"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="transparent"
                  className="text-zinc-100 dark:text-zinc-800"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="64"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray={402} /* 2 * PI * r = ~402 for r=64 */
                  strokeDashoffset={(() => {
                    const maxVal = habit.targetValue || 1;
                    const todayLog = habit.logs?.find(
                      (l: LogCompletion) =>
                        new Date(
                          l.logDate || l.createdAt || "",
                        ).toDateString() === new Date().toDateString(),
                    );
                    const actualValue = todayLog?.actualValue || 0;
                    const progressPercent = Math.min(
                      100,
                      Math.max(0, (actualValue / maxVal) * 100),
                    );
                    return 402 - (progressPercent / 100) * 402;
                  })()}
                  strokeLinecap="round"
                  className="text-emerald-500 transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-4xl mb-1">{habit.icon}</div>
                <div className="text-xs font-bold text-zinc-500">
                  {(() => {
                    const todayLog = habit.logs?.find(
                      (l) =>
                        new Date(
                          l.logDate || l.createdAt || "",
                        ).toDateString() === new Date().toDateString(),
                    );
                    return todayLog?.actualValue || 0;
                  })()}{" "}
                  / {habit.targetValue || 0}
                </div>
              </div>
            </div>
          ) : (
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-4 shadow-sm"
              style={{
                backgroundColor: habit.color + "20",
                color: habit.color,
                border: `2px solid ${habit.color}40`,
              }}
            >
              {habit.icon}
            </div>
          )}

          {isEditing ? (
            <div className="w-full space-y-4 text-left bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm mt-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all sm:text-sm"
                  placeholder="Habit name"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all sm:text-sm resize-none"
                  placeholder="Why do you want to build this habit?"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                  Time
                </label>
                <div className="flex items-center gap-2 px-3 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg focus-within:ring-2 focus-within:ring-zinc-900 dark:focus-within:ring-zinc-100 transition-all">
                  <Clock className="w-4 h-4 text-zinc-400" />
                  <input
                    type="time"
                    value={editedTime}
                    onChange={(e) => setEditedTime(e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-0 p-0 text-zinc-900 dark:text-zinc-100 sm:text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 px-4 py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditedName(habit.name);
                    setEditedDescription(habit.description || "");
                    setEditedTime(
                      habit.scheduledTime?.slice(0, 5) || undefined,
                    );
                  }}
                  className="px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-lg font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                {habit.name}
              </h1>
              {habit.description && (
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-4 max-w-sm">
                  {habit.description}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-medium">
                <span className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-md">
                  {habit.category || "General"}
                </span>
                {habit.scheduledTime && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-md">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{habit.scheduledTime?.slice(0, 5)}</span>
                  </div>
                )}
                {habit.currentStreak > 0 && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-900/50 rounded-md">
                    <Flame className="w-3.5 h-3.5" />
                    <span>{habit.currentStreak} Day Streak</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Main Action */}
        {!isEditing && (
          <div className="mb-8">
            {habit.habitType === "measurable" ? (
              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={async () => {
                    const todayLog = habit.logs?.find(
                      (l: LogCompletion) =>
                        new Date(
                          l.logDate || l.createdAt || "",
                        ).toDateString() === new Date().toDateString(),
                    );
                    const currentVal = todayLog?.actualValue || 0;
                    const newVal = Math.max(0, currentVal - 1);
                    if (newVal !== currentVal) {
                      try {
                        await completeHabit(habit.id, {
                          status:
                            newVal > 0
                              ? LogCompletionType.COMPLETED
                              : LogCompletionType.CANCELLED,
                          actualValue: newVal,
                          logDate: new Date(),
                        });
                      } catch (e) {
                        console.error("Error decrementing habit:", e);
                      }
                    }
                  }}
                  className="w-16 h-16 flex items-center justify-center rounded-2xl bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200 dark:border-zinc-700 text-3xl font-light hover:bg-zinc-50 dark:hover:bg-zinc-700 active:scale-95 transition-transform"
                >
                  -
                </button>
                <div className="text-center w-24">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
                    Adjust
                  </span>
                </div>
                <button
                  onClick={async () => {
                    const todayLog = habit.logs?.find(
                      (l: LogCompletion) =>
                        new Date(
                          l.logDate || l.createdAt || "",
                        ).toDateString() === new Date().toDateString(),
                    );
                    const currentVal = todayLog?.actualValue || 0;
                    const newVal = Math.max(0, currentVal + 1);
                    try {
                      await completeHabit(habit.id, {
                        status: LogCompletionType.COMPLETED,
                        actualValue: newVal,
                        logDate: new Date(),
                      });
                    } catch (e) {
                      console.error("Error incrementing habit:", e);
                    }
                  }}
                  className="w-16 h-16 flex items-center justify-center rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm text-3xl font-light hover:bg-zinc-800 dark:hover:bg-zinc-200 active:scale-95 transition-transform"
                >
                  +
                </button>
              </div>
            ) : !isCompleted ? (
              <button
                onClick={handleComplete}
                className="w-full py-3.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm"
              >
                <Check className="w-5 h-5" />
                Complete Today
              </button>
            ) : (
              <div className="w-full py-3.5 bg-zinc-100 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 rounded-xl font-medium flex items-center justify-center gap-2 border border-zinc-200 dark:border-zinc-800">
                <Check className="w-5 h-5" />
                Completed!
              </div>
            )}
          </div>
        )}

        {/* Charts */}
        {habitId && <HabitCharts habitId={habitId} />}
      </main>
    </div>
  );
}
