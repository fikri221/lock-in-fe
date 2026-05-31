"use client";

import { Habit, LogCompletionType } from "@/types/habits";
import { motion, AnimatePresence } from "framer-motion";
import React, { memo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDateLocal } from "@/hooks/useHabits";

interface TapViewCardProps {
  habit: Habit;
  selectedDate: Date;
  onComplete: (
    id: string,
    data?: { actualValue?: number; logDate?: Date },
  ) => void;
  onSkip: (id: string, data?: { logDate?: Date }) => void;
}

export const TapViewCard = memo(function TapViewCard({
  habit,
  selectedDate,
  onComplete,
  onSkip,
}: TapViewCardProps) {
  const router = useRouter();

  // Calculate the last 5 days ending on selectedDate
  const days = [];
  for (let i = 3; i >= 0; i--) {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - i);
    days.push(d);
  }

  const [modalOpen, setModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState<Date | null>(null);
  const [inputValue, setInputValue] = useState("");

  const handleBoxTap = (date: Date, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    const log = habit.logs?.find(
      (l) =>
        formatDateLocal(l.logDate || l.createdAt || "") ===
        formatDateLocal(date),
    );

    if (habit.habitType === "boolean") {
      if (log?.status === LogCompletionType.COMPLETED) {
        onSkip(habit.id, { logDate: date });
      } else {
        onComplete(habit.id, { logDate: date });
      }
    } else {
      setModalDate(date);
      setInputValue((log?.actualValue ?? 0).toString());
      setModalOpen(true);
    }
  };

  const handleSaveValue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalDate) return;

    const newVal = Number(inputValue);
    if (!isNaN(newVal)) {
      onComplete(habit.id, { actualValue: newVal, logDate: modalDate });
    }
    setModalOpen(false);
  };

  return (
    <div
      onClick={() => router.push(`/habits/${habit.id}`)}
      className="flex items-center justify-between p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
        <span className="text-xl shrink-0 bg-zinc-100 dark:bg-zinc-800 w-10 h-10 flex items-center justify-center rounded-xl">
          {habit.icon}
        </span>
        <p className="text-sm font-semibold truncate text-zinc-900 dark:text-zinc-100">
          {habit.name}
        </p>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {days.map((date) => {
          const log = habit.logs?.find(
            (l) =>
              formatDateLocal(l.logDate || l.createdAt || "") ===
              formatDateLocal(date),
          );

          const isCompleted = log?.status === LogCompletionType.COMPLETED;
          const isSkipped = log?.status === LogCompletionType.SKIPPED;

          if (habit.habitType === "boolean") {
            return (
              <motion.button
                key={date.toISOString()}
                whileTap={{ scale: 0.8 }}
                onClick={(e) => handleBoxTap(date, e)}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center border transition-colors ${
                  isCompleted
                    ? "bg-emerald-500 border-emerald-600 text-white"
                    : isSkipped
                      ? "bg-red-500/10 border-red-500/30 text-red-500"
                      : "bg-zinc-100 border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700"
                }`}
              >
                {isCompleted && <span className="text-sm font-bold">✓</span>}
                {isSkipped && <span className="text-sm font-bold">×</span>}
              </motion.button>
            );
          } else {
            const currentVal = Number(log?.actualValue ?? 0);
            const maxValue = Number(habit.targetValue ?? 1);
            const fillPct = Math.min(
              100,
              Math.max(0, (currentVal / maxValue) * 100),
            );
            const isFull = fillPct >= 100;

            return (
              <motion.button
                key={date.toISOString()}
                whileTap={{ scale: 0.8 }}
                onClick={(e) => handleBoxTap(date, e)}
                className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-lg overflow-hidden border transition-colors ${
                  isFull
                    ? "border-emerald-600/50"
                    : currentVal > 0
                      ? "border-emerald-500/30"
                      : "border-zinc-200 dark:border-zinc-700"
                }`}
              >
                <div className="absolute inset-0 bg-zinc-100 dark:bg-zinc-800 z-0" />
                <div
                  className={`absolute bottom-0 left-0 right-0 z-10 transition-all duration-300 ${
                    isFull ? "bg-emerald-500" : "bg-emerald-500/50"
                  }`}
                  style={{ height: `${fillPct}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <span
                    className={`text-[10px] sm:text-xs font-semibold ${
                      isFull
                        ? "text-white"
                        : currentVal > 0
                          ? "text-emerald-800 dark:text-emerald-200"
                          : "text-zinc-400 dark:text-zinc-500"
                    }`}
                  >
                    {currentVal > 0 ? currentVal : ""}
                  </span>
                </div>
              </motion.button>
            );
          }
        })}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => {
                e.stopPropagation();
                setModalOpen(false);
              }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
            >
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                Log {habit.name}
              </h3>
              <p className="text-sm text-zinc-500 mb-4">
                Enter value for{" "}
                {modalDate?.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </p>

              <form onSubmit={handleSaveValue}>
                <div className="flex items-center gap-3 mb-6">
                  <input
                    type="number"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-lg font-semibold text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                    placeholder="0"
                    autoFocus
                  />
                  {habit.targetUnit && (
                    <span className="text-zinc-500 font-medium">
                      {habit.targetUnit}
                    </span>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 rounded-xl bg-zinc-100 py-3 font-semibold text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-emerald-500 py-3 font-semibold text-white hover:bg-emerald-600 shadow-sm shadow-emerald-500/20 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
});
