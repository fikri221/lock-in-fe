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

  // Type guard for Axios errors
  function isAxiosError(
    error: unknown,
  ): error is { response?: { data?: { error?: string } } } {
    return typeof error === "object" && error !== null && "response" in error;
  }

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
      toast.success("Habit created successfully!");
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
      toast.success("Habit updated successfully!");
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
          const optimisticLog = {
            ...logCompletion,
            status: LogCompletionType.COMPLETED,
          };
          return {
            ...h,
            currentStreak: h.currentStreak + 1,
            totalCompletions: h.totalCompletions + 1,
            logs: [...(h.logs || []), optimisticLog],
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
            return {
              ...h,
              logs: [...(h.logs || []).slice(0, -1), newLog],
            };
          }
          return h;
        }),
      );

      toast.success("Habit completed! 🎉");
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
          const optimisticLog = {
            ...logCompletion,
          };

          let currentStreak = h.currentStreak;
          let totalCompletions = h.totalCompletions;

          // Check if the habit was completed
          const wasCompleted = h.logs?.some(
            (l) => l.status === LogCompletionType.COMPLETED,
          );

          // If the habit was completed, decrement the streak and total completions
          if (wasCompleted) {
            currentStreak = Math.max(0, currentStreak - 1);
            totalCompletions = Math.max(0, totalCompletions - 1);
          }

          return {
            ...h,
            currentStreak,
            totalCompletions,
            logs: [
              ...(h.logs || []).filter(
                (l) =>
                  // Remove completed and skipped logs
                  l.status !== LogCompletionType.COMPLETED &&
                  l.status !== LogCompletionType.SKIPPED,
              ),
              optimisticLog,
            ],
          };
        }
        return h;
      }),
    );

    try {
      const response = await habitsAPI.cancelHabit(id, logCompletion);
      const newLog = response.data.habitLog;

      // Sync with server data (replace the optimistic log with the real one)
      setHabits((prev) =>
        prev.map((h) => {
          if (h.id === id) {
            return {
              ...h,
              logs: [...(h.logs || []).slice(0, -1), newLog],
            };
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
          const optimisticLog = {
            ...logCompletion,
            status: LogCompletionType.SKIPPED,
          };
          return {
            ...h,
            logs: [...(h.logs || []), optimisticLog],
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
      setHabits((prev) =>
        prev.map((h) => {
          if (h.id === id) {
            return {
              ...h,
              logs: [...(h.logs || []).slice(0, -1), newLog],
            };
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
