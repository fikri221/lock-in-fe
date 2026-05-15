"use client";

import { Habit, LogCompletionType } from "@/types/habits";
import { motion } from "framer-motion";
import React, { memo } from "react";
import { useRouter } from "next/navigation";

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
  for (let i = 4; i >= 0; i--) {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - i);
    days.push(d);
  }

  const handleBoxTap = (date: Date, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    const log = habit.logs?.find(
      (l) =>
        new Date(l.logDate || l.createdAt || "").toDateString() ===
        date.toDateString(),
    );

    if (habit.habitType === "boolean") {
      if (log?.status === LogCompletionType.COMPLETED) {
        onSkip(habit.id, { logDate: date });
      } else {
        onComplete(habit.id, { logDate: date });
      }
    } else {
      const currentVal = Number(log?.actualValue ?? 0);
      const maxValue = Number(habit.targetValue ?? 100);
      const step = 1;
      const newVal = currentVal + step;
      onComplete(habit.id, { actualValue: newVal, logDate: date });
    }
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
              new Date(l.logDate || l.createdAt || "").toDateString() ===
              date.toDateString(),
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
    </div>
  );
});
