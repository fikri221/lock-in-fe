// src/hooks/useHabits.ts
import { useState, useEffect, useCallback } from "react";
import { habitsAPI } from "@/lib/api";
import {
  CreateHabitRequest,
  Habit,
  LogCompletion,
  LogCompletionType,
  UpdateHabitRequest,
} from "@/types/habits";
import { toast } from "sonner";
import { isAxiosError } from "@/utils/errorHandlers";

export const useHabits = (
  dateOrRange: string | { startDate: string; endDate: string },
) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHabits = useCallback(async () => {
    try {
      setLoading(true);
      const params =
        typeof dateOrRange === "string"
          ? { date: dateOrRange, active: true }
          : { ...dateOrRange, active: true };

      const response = await habitsAPI.getHabits(params);
      setHabits(response.data.habits);
      setError(null);
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        setError(err.response?.data?.error || "Failed to fetch habits");
      } else if (err instanceof Error) {
        setError(err.message || "Failed to fetch habits");
      } else {
        setError("Failed to fetch habits");
      }
      toast.error("Failed to load habits");
    } finally {
      setLoading(false);
    }
  }, [dateOrRange]);

  const createHabit = async (data: CreateHabitRequest) => {
    // Optimistic update
    setHabits((prev) => [
      {
        ...data,
        id: "",
        currentStreak: 0,
        totalCompletions: 0,
        longestStreak: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    try {
      const response = await habitsAPI.createHabit(data);
      setHabits((prev) =>
        prev.map((h) => (h.id === "" ? response.data.habit : h)),
      );
      // toast.success("Habit created successfully!");
      return response.data.habit;
    } catch (err: unknown) {
      // Rollback
      setHabits((prev) => prev.filter((h) => h.id !== ""));
      if (isAxiosError(err)) {
        toast.error(err.response?.data?.error || "Failed to create habit");
      } else if (err instanceof Error) {
        toast.error(err.message || "Failed to create habit");
      } else {
        toast.error("Failed to create habit");
      }
      throw err;
    }
  };

  const updateHabit = async (id: string, data: UpdateHabitRequest) => {
    const previousHabits = habits;
    // Optimistic update
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, ...data } : h)));
    try {
      const response = await habitsAPI.updateHabit(id, data);
      // toast.success("Habit updated successfully!");
      return response.data.habit;
    } catch (err: unknown) {
      // Rollback
      setHabits(previousHabits);
      if (isAxiosError(err)) {
        toast.error(err.response?.data?.error || "Failed to update habit");
      } else if (err instanceof Error) {
        toast.error(err.message || "Failed to update habit");
      } else {
        toast.error("Failed to update habit");
      }
      throw err;
    }
  };

  const deleteHabit = async (id: string) => {
    const previousHabits = habits;
    // Optimistic soft delete
    setHabits((prev) => prev.filter((h) => h.id !== id));
    try {
      await habitsAPI.deleteHabit(id);
      toast.success("Habit deleted successfully!");
    } catch (err: unknown) {
      // Rollback
      setHabits(previousHabits);
      if (isAxiosError(err)) {
        toast.error(err.response?.data?.error || "Failed to delete habit");
      } else if (err instanceof Error) {
        toast.error(err.message || "Failed to delete habit");
      } else {
        toast.error("Failed to delete habit");
      }
      throw err;
    }
  };

  const completeHabit = async (id: string, logCompletion: LogCompletion) => {
    const previousHabits = habits;

    // Optimistic Update
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === id) {
          const logDate = new Date(logCompletion.logDate || new Date());
          const existingLogIndex = (h.logs || []).findIndex(
            (l) =>
              new Date(l.logDate || l.createdAt || "").toDateString() ===
              logDate.toDateString(),
          );

          const newLogs = [...(h.logs || [])];
          let currentStreak = h.currentStreak;
          let totalCompletions = h.totalCompletions;

          if (existingLogIndex >= 0) {
            // Update existing log
            const oldStatus = newLogs[existingLogIndex].status;
            newLogs[existingLogIndex] = {
              ...newLogs[existingLogIndex],
              ...logCompletion,
              status: LogCompletionType.COMPLETED,
            };

            // If it wasn't completed before, increment stats
            if (oldStatus !== LogCompletionType.COMPLETED) {
              currentStreak += 1;
              totalCompletions += 1;
            }
          } else {
            // Add new log
            newLogs.push({
              ...logCompletion,
              status: LogCompletionType.COMPLETED,
              createdAt: new Date().toISOString(),
            });
            currentStreak += 1;
            totalCompletions += 1;
          }

          return {
            ...h,
            currentStreak,
            totalCompletions,
            logs: newLogs,
            lastCompleted: new Date().toISOString(),
          };
        }
        return h;
      }),
    );

    try {
      const response = await habitsAPI.logCompletion(id, logCompletion);
      const newLog = response.data.habitLog;

      // Sync with server data (replace the optimistic log with the real one)
      setHabits((prev) =>
        prev.map((h) => {
          if (h.id === id) {
            const logDate = new Date(logCompletion.logDate || new Date());
            // Replace the log for this date with the real one from server
            const newLogs = (h.logs || []).map((l) =>
              new Date(l.logDate || l.createdAt || "").toDateString() ===
              logDate.toDateString()
                ? newLog
                : l,
            );
            return { ...h, logs: newLogs };
          }
          return h;
        }),
      );

      // toast.success("Habit completed! 🎉");
      return newLog;
    } catch (err: unknown) {
      // Rollback
      setHabits(previousHabits);

      if (isAxiosError(err)) {
        toast.error(err.response?.data?.error || "Failed to log habit");
      } else if (err instanceof Error) {
        toast.error(err.message || "Failed to log habit");
      } else {
        toast.error("Failed to log habit");
      }
      throw err;
    }
  };

  const cancelHabit = async (id: string, logCompletion: LogCompletion) => {
    const previousHabits = habits; // Capture state

    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === id) {
          const logDate = new Date(logCompletion.logDate || new Date());
          const existingLogIndex = (h.logs || []).findIndex(
            (l) =>
              new Date(l.logDate || l.createdAt || "").toDateString() ===
              logDate.toDateString(),
          );

          const newLogs = [...(h.logs || [])];
          let currentStreak = h.currentStreak;
          let totalCompletions = h.totalCompletions;

          if (existingLogIndex >= 0) {
            const oldStatus = newLogs[existingLogIndex].status;
            // If we are cancelling a completed habit
            if (oldStatus === LogCompletionType.COMPLETED) {
              currentStreak = Math.max(0, currentStreak - 1);
              totalCompletions = Math.max(0, totalCompletions - 1);
            }
            // Remove the log effectively (or mark as cancelled if you persist history)
            // For now, let's remove it from the list to show "unchecked" state
            newLogs.splice(existingLogIndex, 1);
          }

          return {
            ...h,
            currentStreak,
            totalCompletions,
            logs: newLogs,
          };
        }
        return h;
      }),
    );

    try {
      const response = await habitsAPI.cancelHabit(id, logCompletion);
      const newLog = response.data.habitLog;

      // Sync with server data (replace the optimistic log with the real one)
      // Sync with server data
      setHabits((prev) =>
        prev.map((h) => {
          if (h.id === id) {
            // If server returns a cancelled log, we might want to keep it or just ensure
            // the local state reflects "no completion".
            // If we removed it optimistically, we might not need to do anything
            // unless the server says "actually it failed to cancel".
            // But if the server returns a "Cancelled" log, we can insert it if needed.
            // For now, ensuring it's not in the list is enough for UI "unchecked".
            return h;
          }
          return h;
        }),
      );

      toast.info("Habit cancelled for today");
      return newLog;
    } catch (err: unknown) {
      // Rollback
      setHabits(previousHabits);

      if (isAxiosError(err)) {
        toast.error(err.response?.data?.error || "Failed to cancel habit");
      } else if (err instanceof Error) {
        toast.error(err.message || "Failed to cancel habit");
      } else {
        toast.error("Failed to cancel habit");
      }
      throw err;
    }
  };

  const skipHabit = async (id: string, logCompletion: LogCompletion) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === id) {
          const logDate = new Date(logCompletion.logDate || new Date());
          const existingLogIndex = (h.logs || []).findIndex(
            (l) =>
              new Date(l.logDate || l.createdAt || "").toDateString() ===
              logDate.toDateString(),
          );

          const newLogs = [...(h.logs || [])];
          let currentStreak = h.currentStreak;
          let totalCompletions = h.totalCompletions;

          const optimisticLog = {
            ...logCompletion,
            status: LogCompletionType.SKIPPED,
            createdAt: new Date().toISOString(),
          };

          if (existingLogIndex >= 0) {
            const oldStatus = newLogs[existingLogIndex].status;
            // If it was completed before, decrement stats
            if (oldStatus === LogCompletionType.COMPLETED) {
              currentStreak = Math.max(0, currentStreak - 1);
              totalCompletions = Math.max(0, totalCompletions - 1);
            }
            newLogs[existingLogIndex] = {
              ...newLogs[existingLogIndex],
              ...optimisticLog,
            };
          } else {
            newLogs.push(optimisticLog);
          }

          return {
            ...h,
            currentStreak,
            totalCompletions,
            logs: newLogs,
          };
        }
        return h;
      }),
    );

    try {
      const response = await habitsAPI.logCompletion(id, {
        ...logCompletion,
        status: LogCompletionType.SKIPPED,
      });
      const newLog = response.data.habitLog;

      // Sync with server data (replace the optimistic log with the real one)
      // Sync with server data
      setHabits((prev) =>
        prev.map((h) => {
          if (h.id === id) {
            const logDate = new Date(logCompletion.logDate || new Date());
            const newLogs = (h.logs || []).map((l) =>
              new Date(l.logDate || l.createdAt || "").toDateString() ===
              logDate.toDateString()
                ? newLog
                : l,
            );
            return { ...h, logs: newLogs };
          }
          return h;
        }),
      );

      toast.info("Habit skipped for today");
      return newLog;
    } catch (err: unknown) {
      // Rollback
      setHabits((prev) =>
        prev.map((h) =>
          h.id === id
            ? {
                ...h,
                logs: [...(h.logs || []).slice(0, -1)],
              }
            : h,
        ),
      );
      if (isAxiosError(err)) {
        toast.error(err.response?.data?.error || "Failed to skip habit");
      } else if (err instanceof Error) {
        toast.error(err.message || "Failed to skip habit");
      } else {
        toast.error("Failed to skip habit");
      }
      throw err;
    }
  };

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  return {
    habits,
    loading,
    error,
    fetchHabits,
    createHabit,
    updateHabit,
    deleteHabit,
    cancelHabit,
    completeHabit,
    skipHabit,
  };
};
