"use client";

import { useCallback, useEffect, useState, memo, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Settings } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useHabits } from "@/hooks/useHabits";
import { AnimatePresence, motion } from "framer-motion";
import HabitForm from "@/components/habits/HabitForm";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";
import SettingsModal from "@/components/dashboard/SettingsModal";
import HorizontalCalendar from "@/components/dashboard/HorizontalCalendar";
import {
  LogCompletionType,
  CreateHabitRequest,
  LogCompletion,
  Habit,
} from "@/types/habits";
import { BooleanCard } from "@/components/habits/BooleanCard";
import { MeasurableCard } from "@/components/habits/MeasurableCard";
import { TapViewCard } from "@/components/habits/TapViewCard";

interface HabitItemProps {
  habit: Habit;
  log?: LogCompletion;
  selectedDate: Date;
  interactionMode: "swipe" | "tap";
  onComplete: (
    id: string,
    data?: { actualValue?: number; logDate?: Date },
  ) => void;
  onSkip: (id: string, data?: { logDate?: Date }) => void;
  onDelete: (id: string) => void;
  onDragToggle: (id: string, isDragging: boolean) => void;
}

const HabitItem = memo(
  function HabitItem({
    habit,
    log,
    selectedDate,
    interactionMode,
    onComplete,
    onSkip,
    onDelete,
    onDragToggle,
  }: HabitItemProps) {
    const handleComplete = useCallback(() => {
      onComplete(habit.id, { logDate: selectedDate });
    }, [habit.id, onComplete, selectedDate]);

    const handleSkip = useCallback(() => {
      onSkip(habit.id, { logDate: selectedDate });
    }, [habit.id, onSkip, selectedDate]);

    const handleSetValue = useCallback(
      (data: { actualValue: number }) => {
        onComplete(habit.id, { logDate: selectedDate, ...data });
      },
      [habit.id, onComplete, selectedDate],
    );

    const handleDelete = useCallback(() => {
      onDelete(habit.id);
    }, [habit.id, onDelete]);

    const handleToggle = useCallback(
      (isDragging: boolean) => {
        onDragToggle(habit.id, isDragging);
      },
      [habit.id, onDragToggle],
    );

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{
          opacity: 0,
          scale: 0.8,
          transition: { duration: 0.2 },
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
          opacity: { duration: 0.2 },
        }}
        className="relative"
      >
        {habit.habitType === "boolean" ? (
          <BooleanCard
            habit={habit}
            log={log}
            interactionMode={interactionMode}
            onComplete={handleComplete}
            onSkip={handleSkip}
            onDelete={handleDelete}
            onDragToggle={handleToggle}
          />
        ) : (
          <MeasurableCard
            habit={habit}
            log={log}
            interactionMode={interactionMode}
            onSetValue={handleSetValue}
            onDelete={handleDelete}
            onDragToggle={handleToggle}
          />
        )}
      </motion.div>
    );
  },
  (prev, next) => {
    // Hanya render ulang jika tanggal berubah
    if (prev.selectedDate.getTime() !== next.selectedDate.getTime())
      return false;

    // Cek perubahan mode interaksi
    if (prev.interactionMode !== next.interactionMode) return false;

    // Cek perubahan log
    if (prev.log?.status !== next.log?.status) return false;
    if (prev.log?.actualValue !== next.log?.actualValue) return false;

    // Cek perubahan habit
    if (prev.habit.id !== next.habit.id) return false;
    if (prev.habit.name !== next.habit.name) return false;
    if (prev.habit.targetValue !== next.habit.targetValue) return false;
    if (prev.habit.habitType !== next.habit.habitType) return false;
    if (prev.habit.icon !== next.habit.icon) return false;
    if (prev.habit.color !== next.habit.color) return false;

    return true;
  },
);

export default function Dashboard() {
  const router = useRouter();

  const [interactionMode, setInteractionMode] = useState<"swipe" | "tap">(
    () => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("interactionMode");
        if (stored === "swipe" || stored === "tap") {
          return stored;
        }
      }
      return "swipe";
    },
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("interactionMode", interactionMode);
    }
  }, [interactionMode]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("dashboardDate");
      if (stored) {
        const date = new Date(stored);
        if (!isNaN(date.getTime())) return date;
      }
    }
    return new Date();
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("dashboardDate", selectedDate.toISOString());
    }
  }, [selectedDate]);

  const [draggingId, setDraggingId] = useState<string | null>(null);

  /* ─── Drag to Delete State ─── */
  const handleDragToggle = useCallback((id: string, isDragging: boolean) => {
    setDraggingId((prev) => {
      if (isDragging) return id;
      if (prev === id) return null;
      return prev;
    });
  }, []);

  const { isAuthenticated, isLoading: authLoading, logout } = useAuthStore();
  const {
    habits,
    loading,
    createHabit,
    completeHabit,
    skipHabit,
    deleteHabit,
  } = useHabits(selectedDate.toDateString());

  // Filter habits for selected date
  const todaysHabits = useMemo(() => {
    return habits.filter((habit) => {
      // If targetDays is defined and not empty, check if today is included
      if (habit.targetDays && habit.targetDays.length > 0) {
        const dayOfWeek = selectedDate.getDay();
        return habit.targetDays.some((d) => Number(d) === dayOfWeek);
      }
      // Otherwise show (Daily, Weekly Flexible, etc.)
      return true;
    });
  }, [habits, selectedDate]);

  const selectedDateStr = useMemo(
    () => selectedDate.toDateString(),
    [selectedDate],
  );

  const { completedToday, totalHabits } = useMemo(() => {
    const doneCount = todaysHabits.filter((h) => {
      if (!h.logs || h.logs.length === 0) return false;
      // Search backwards because recent logs are at the end
      for (let i = h.logs.length - 1; i >= 0; i--) {
        const l = h.logs[i];
        if (
          new Date(l.logDate || l.createdAt || "").toDateString() ===
          selectedDateStr
        ) {
          return l.status === LogCompletionType.COMPLETED;
        }
      }
      return false;
    }).length;
    return {
      completedToday: doneCount,
      totalHabits: todaysHabits.length,
    };
  }, [todaysHabits, selectedDateStr]);

  useEffect(() => {
    // Check authentication
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  // useEffect(() => {
  //   // Mock weather data
  //   setWeather({
  //     temp: 28,
  //     condition: "Clear",
  //     description: "clear sky",
  //     icon: "01d",
  //   });
  // }, []);

  const handleCompleteHabit = useCallback(
    async (
      habitId: string,
      data?: { actualValue?: number; logDate?: Date },
    ) => {
      try {
        await completeHabit(habitId, {
          status: LogCompletionType.COMPLETED,
          ...data,
        });
      } catch (error) {
        console.error("Error completing habit:", error);
      }
    },
    [completeHabit],
  );

  const handleSkipHabit = useCallback(
    async (habitId: string, data?: { logDate?: Date }) => {
      try {
        await skipHabit(habitId, {
          status: LogCompletionType.SKIPPED,
          ...data,
        });
      } catch (error) {
        console.error("Error skipping habit:", error);
      }
    },
    [skipHabit],
  );

  const handleDeleteHabit = useCallback(
    async (habitId: string) => {
      setDraggingId(null);
      if (confirm("Are you sure you want to delete this habit?")) {
        try {
          await deleteHabit(habitId);
        } catch (error) {
          console.error("Error deleting habit:", error);
        }
      }
    },
    [deleteHabit],
  );

  const handleAddHabit = async (habitData: CreateHabitRequest) => {
    setIsFormOpen(false);
    try {
      await createHabit(habitData);
    } catch (error) {
      console.error("Error creating habit:", error);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Show loading state
  if (authLoading || (loading && habits.length === 0)) {
    return <DashboardSkeleton />;
  }

  // Redirect if not authenticated (after loading)
  if (!isAuthenticated) {
    return null; // or return login page redirect component if handled differently
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/80 px-3 sm:px-4 py-3 sm:py-4 backdrop-blur-lg dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto max-w-lg">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              {selectedDate.toDateString()}
            </p>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-baseline justify-between">
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Today&apos;s Habits
            </h1>
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              {completedToday}/{totalHabits} done
            </span>
          </div>
        </div>
      </header>

      {/* Cards */}
      <main className="mx-auto w-full max-w-lg flex-1 px-3 sm:px-4 py-4 sm:py-6 relative">
        {/* Horizontal Calendar */}
        <div className="backdrop-blur-sm px-4 pb-4">
          <HorizontalCalendar
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </div>

        {/* 5-Day Header for Tap Mode */}
        {interactionMode === "tap" && habits.length > 0 && (
          <div className="flex justify-end px-3 sm:px-4 mb-2">
            <div className="flex items-center gap-1.5 shrink-0">
              {[3, 2, 1, 0].map((offset) => {
                const d = new Date(selectedDate);
                d.setDate(d.getDate() - offset);
                const dayName = d
                  .toLocaleDateString("en-US", { weekday: "short" })
                  .substring(0, 2);
                const dateNum = d.getDate();
                const isToday = d.toDateString() === new Date().toDateString();

                return (
                  <div
                    key={offset}
                    className={`flex flex-col items-center justify-center w-7 sm:w-8 ${
                      isToday
                        ? "text-emerald-500"
                        : "text-zinc-500 dark:text-zinc-400"
                    }`}
                  >
                    <span className="text-[10px] font-semibold uppercase">
                      {dayName}
                    </span>
                    <span className="text-xs font-bold">{dateNum}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <div className="flex flex-col gap-3 pb-4">
          <AnimatePresence mode="popLayout">
            {todaysHabits.map((habit) => {
              // Find log by searching backwards
              let log = undefined;
              if (habit.logs && habit.logs.length > 0) {
                for (let i = habit.logs.length - 1; i >= 0; i--) {
                  const l = habit.logs[i];
                  if (
                    new Date(l.logDate || l.createdAt || "").toDateString() ===
                    selectedDateStr
                  ) {
                    log = l;
                    break;
                  }
                }
              }

              return interactionMode === "tap" ? (
                <motion.div
                  key={habit.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <TapViewCard
                    habit={habit}
                    selectedDate={selectedDate}
                    onComplete={handleCompleteHabit}
                    onSkip={handleSkipHabit}
                  />
                </motion.div>
              ) : (
                <HabitItem
                  key={habit.id}
                  habit={habit}
                  log={log}
                  selectedDate={selectedDate}
                  interactionMode={interactionMode}
                  onComplete={handleCompleteHabit}
                  onSkip={handleSkipHabit}
                  onDelete={handleDeleteHabit}
                  onDragToggle={handleDragToggle}
                />
              );
            })}
          </AnimatePresence>
        </div>

        {habits.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-4xl">🌱</p>
            <p className="mt-3 text-sm text-zinc-500">
              No habits for today. Create one to get started.
            </p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="mt-3 inline-flex items-center rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              + Add Habit
            </button>
          </div>
        )}

        {/* Instructions hint */}
        {habits.length > 0 && (
          <div className="mt-2 mb-24 rounded-xl bg-zinc-100 px-3 py-3 text-center dark:bg-zinc-900 sm:px-4">
            <p className="text-[11px] sm:text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              {interactionMode === "swipe" ? (
                <>
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    Swipe right
                  </span>{" "}
                  to complete &middot;{" "}
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    Drag card
                  </span>{" "}
                  to set value
                </>
              ) : (
                <>
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    Tap card
                  </span>{" "}
                  to complete or add 1
                </>
              )}{" "}
              &middot;{" "}
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                Long press
              </span>{" "}
              to drag & delete
            </p>
          </div>
        )}

        {/* Interaction Mode Toggle */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-zinc-900/90 dark:bg-zinc-100/90 backdrop-blur-md p-1 rounded-full flex gap-1 shadow-lg border border-white/10 dark:border-black/10">
          <button
            onClick={() => setInteractionMode("swipe")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              interactionMode === "swipe"
                ? "bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 shadow-sm"
                : "text-zinc-400 hover:text-white dark:text-zinc-500 dark:hover:text-zinc-900"
            }`}
          >
            Swipe
          </button>
          <button
            onClick={() => setInteractionMode("tap")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              interactionMode === "tap"
                ? "bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 shadow-sm"
                : "text-zinc-400 hover:text-white dark:text-zinc-500 dark:hover:text-zinc-900"
            }`}
          >
            Tap
          </button>
        </div>

        {/* Trash Bin Drop Zone */}
        <AnimatePresence>
          {draggingId && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed bottom-0 left-0 right-0 h-40 z-40 flex items-center justify-center bg-gradient-to-t from-red-500/20 to-transparent pointer-events-none"
            >
              <div className="flex flex-col items-center text-red-500">
                <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full mb-2">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                </div>
                <span className="font-bold">Release to Delete</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Add Button */}
        {!draggingId && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsFormOpen(true)}
            className="fixed bottom-6 right-6 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 shadow-lg shadow-zinc-900/20 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 sm:right-[calc(50%-16rem+1.5rem)]"
          >
            <Plus className="w-6 h-6" />
          </motion.button>
        )}
      </main>

      {/* Undo Toast */}
      {/* <AnimatePresence>
        {undo && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
          >
            <div className="flex items-center gap-3 rounded-full bg-zinc-900 px-5 py-2.5 shadow-lg dark:bg-zinc-100">
              <span className="text-sm text-white dark:text-zinc-900">
                {undo.type === "complete"
                  ? "Habit completed"
                  : undo.type === "skip"
                    ? "Habit skipped"
                    : "Value updated"}
              </span>
              <button
                onClick={handleUndo}
                className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 dark:text-emerald-600 dark:hover:text-emerald-700"
              >
                Undo
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Habit Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <HabitForm
            onClose={() => setIsFormOpen(false)}
            onSubmit={handleAddHabit}
          />
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <SettingsModal
            onClose={() => setIsSettingsOpen(false)}
            onLogout={handleLogout}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
