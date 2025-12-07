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

export const useHabits = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHabits = useCallback(async () => {
    try {
      setLoading(true);
      const response = await habitsAPI.getHabits({ active: true });
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
  }, []);

  // Type guard for Axios errors
  function isAxiosError(
    error: unknown
  ): error is { response?: { data?: { error?: string } } } {
    return typeof error === "object" && error !== null && "response" in error;
  }

  const createHabit = async (data: CreateHabitRequest) => {
    try {
      const response = await habitsAPI.createHabit(data);
      setHabits((prev) => [response.data.habit, ...prev]);
      toast.success("Habit created successfully!");
      return response.data.habit;
    } catch (err: unknown) {
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
    try {
      const response = await habitsAPI.updateHabit(id, data);
      setHabits((prev) =>
        prev.map((h) => (h.id === id ? response.data.habit : h))
      );
      toast.success("Habit updated successfully!");
      return response.data.habit;
    } catch (err: unknown) {
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
    try {
      await habitsAPI.deleteHabit(id);
      setHabits((prev) => prev.filter((h) => h.id !== id));
      toast.success("Habit deleted successfully!");
    } catch (err: unknown) {
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
    try {
      const response = await habitsAPI.logCompletion(id, logCompletion);
      const newLog = response.data.habitLog;
      console.log("Log completion response:", response);

      // setHabits((prev) =>
      //   prev.map((h) => {
      //     if (h.id === id) {
      //       return {
      //         ...h,
      //         ...response.data.habitLog,
      //         logs: response.data.habitLog.logs ?? h.logs ?? [],
      //       };
      //     }
      //     return h;
      //   })
      // );

      setHabits((prev) =>
        prev.map((h) => {
          if (h.id === id) {
            return {
              ...h,
              currentStreak: h.currentStreak + 1,
              totalCompletions: h.totalCompletions + 1,
              logs: [...(h.logs || []), newLog],
              lastCompleted: new Date().toISOString(),
            };
          }
          return h;
        })
      );

      toast.success("Habit completed! 🎉");
      return newLog;
    } catch (err: unknown) {
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

  const skipHabit = async (id: string) => {
    try {
      const response = await habitsAPI.logCompletion(id, {
        status: LogCompletionType.SKIPPED,
      });
      const newLog = response.data.habitLog;

      setHabits((prev) =>
        prev.map((h) => {
          if (h.id === id) {
            return {
              ...h,
              logs: [...(h.logs || []), newLog],
            };
          }
          return h;
        })
      );

      toast.info("Habit skipped for today");
      return newLog;
    } catch (err: unknown) {
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
    completeHabit,
    skipHabit,
  };
};
