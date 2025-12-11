"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, LogOut, LockKeyholeIcon } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useHabits } from "@/hooks/useHabits";
import HabitCard from "@/components/habits/HabitCard";
import HabitForm from "@/components/habits/HabitForm";
import ContextCards from "@/components/dashboard/ContextCards";
import SmartSuggestions from "@/components/dashboard/SmartSuggestions";
import WeeklyChart from "@/components/dashboard/WeeklyChart";
import { Weather } from "@/types/weather";
import { Habit, LogCompletionType } from "@/types/habits";

export default function Dashboard() {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
    logout,
  } = useAuthStore();
  const {
    habits,
    loading,
    createHabit,
    completeHabit,
    skipHabit,
    deleteHabit,
    cancelHabit,
  } = useHabits();

  const [weather, setWeather] = useState<Weather | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    // Check authentication
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    // Mock weather data
    setWeather({
      temp: 28,
      condition: "Clear",
      description: "clear sky",
      icon: "01d",
    });
  }, []);

  const handleCompleteHabit = async (habitId: string) => {
    try {
      await completeHabit(habitId, { status: LogCompletionType.COMPLETED });
    } catch (error) {
      console.error("Error completing habit:", error);
    }
  };

  const handleSkipHabit = async (habitId: string) => {
    try {
      await skipHabit(habitId);
    } catch (error) {
      console.error("Error skipping habit:", error);
    }
  };

  const handleCancelHabit = async (habitId: string) => {
    try {
      await cancelHabit(habitId);
    } catch (error) {
      console.error("Error cancelling habit:", error);
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    try {
      await deleteHabit(habitId);
    } catch (error) {
      console.error("Error deleting habit:", error);
    }
  };

  const handleAddHabit = async (habitData: Habit) => {
    try {
      await createHabit(habitData);
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error creating habit:", error);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Show loading state
  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const completedToday = habits.filter((h) =>
    (h.logs ?? []).some((l) => l.status === LogCompletionType.COMPLETED)
  ).length;
  const totalHabits = habits.length;
  const completionRate =
    totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <LockKeyholeIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Lock In</h1>
                <p className="text-xs text-gray-500">
                  Welcome, {user?.name || user?.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-green-700">
                  {completedToday}/{totalHabits} Today
                </span>
              </div>

              <button
                onClick={() => setIsFormOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Add Habit</span>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ContextCards
          weather={weather}
          habits={habits}
          completionRate={completionRate}
        />
        <SmartSuggestions habits={habits} weather={weather} />

        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Your Habits</h2>
              <p className="text-gray-600 mt-1">Track your daily progress</p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : habits.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-300">
              <LockKeyholeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No habits yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start building better habits today!
              </p>
              <button
                onClick={() => setIsFormOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all"
              >
                <Plus className="w-5 h-5" />
                Create Your First Habit
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {habits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onComplete={handleCompleteHabit}
                  onSkip={handleSkipHabit}
                  onDelete={handleDeleteHabit}
                  onCancel={handleCancelHabit}
                  weather={weather}
                />
              ))}
            </div>
          )}
        </div>

        {habits.length > 0 && (
          <div className="mt-8">
            <WeeklyChart habits={habits} />
          </div>
        )}
      </main>

      {isFormOpen && (
        <HabitForm
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleAddHabit}
        />
      )}
    </div>
  );
}
