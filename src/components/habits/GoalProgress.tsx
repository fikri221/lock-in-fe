// frontend/src/components/habits/GoalProgress.tsx (UPDATED with real API)
"use client";

import { useState, useEffect } from "react";
import { Target, Plus, X } from "lucide-react";
import { habitsAPI } from "@/lib/api";
import { toast } from "sonner";

interface GoalProgressProps {
  habitId: string;
}

interface ProgressData {
  current: number;
  target: number;
  percentage: number;
  remaining: number;
  isCompleted: boolean;
}

export default function GoalProgress({ habitId }: GoalProgressProps) {
  const [hasGoal, setHasGoal] = useState(false);
  const [isSettingGoal, setIsSettingGoal] = useState(false);
  const [goalValue, setGoalValue] = useState(5);
  const [goalPeriod, setGoalPeriod] = useState<"weekly" | "monthly">("weekly");
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGoal();
  }, [habitId]);

  const fetchGoal = async () => {
    setLoading(true);
    try {
      const response = await habitsAPI.getGoal(habitId);
      const data = response.data;

      if (data.hasGoal) {
        setHasGoal(true);
        setProgress(data.progress);
        setGoalValue(data.goal.target);
        setGoalPeriod(data.goal.period);
      } else {
        setHasGoal(false);
      }
    } catch (error) {
      console.error("Error fetching goal:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGoal = async () => {
    try {
      await habitsAPI.setGoal(habitId, {
        target: goalValue,
        period: goalPeriod,
      });
      toast.success("Goal set successfully!");
      setIsSettingGoal(false);
      fetchGoal();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to set goal");
    }
  };

  const handleRemoveGoal = async () => {
    if (confirm("Are you sure you want to remove this goal?")) {
      try {
        await habitsAPI.removeGoal(habitId);
        toast.success("Goal removed");
        setHasGoal(false);
        setProgress(null);
      } catch (error) {
        toast.error("Failed to remove goal");
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 mb-8 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="h-4 bg-gray-200 rounded w-full" />
      </div>
    );
  }

  if (!hasGoal && !isSettingGoal) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-blue-600" />
            <div>
              <h3 className="font-bold text-gray-900">Set a Goal</h3>
              <p className="text-sm text-gray-600">
                Challenge yourself to stay consistent!
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSettingGoal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Set Goal
          </button>
        </div>
      </div>
    );
  }

  if (isSettingGoal) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 text-lg">Set Your Goal</h3>
          <button
            onClick={() => setIsSettingGoal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Period
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setGoalPeriod("weekly")}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                  goalPeriod === "weekly"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setGoalPeriod("monthly")}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                  goalPeriod === "monthly"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Monthly
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How many times per {goalPeriod === "weekly" ? "week" : "month"}?
            </label>
            <input
              type="number"
              min="1"
              max={goalPeriod === "weekly" ? 7 : 31}
              value={goalValue}
              onChange={(e) => setGoalValue(parseInt(e.target.value))}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSaveGoal}
            className="flex-1 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold transition-colors"
          >
            Save Goal
          </button>
          <button
            onClick={() => setIsSettingGoal(false)}
            className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Show goal progress
  if (!progress) return null;

  const isCompleted = progress.isCompleted;

  return (
    <div
      className={`rounded-2xl p-6 border mb-8 ${
        isCompleted
          ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-300"
          : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${
              isCompleted ? "bg-green-100" : "bg-blue-100"
            }`}
          >
            <Target
              className={`w-6 h-6 ${
                isCompleted ? "text-green-600" : "text-blue-600"
              }`}
            />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">
              {goalPeriod === "weekly" ? "Weekly" : "Monthly"} Goal
            </h3>
            <p className="text-sm text-gray-600">
              Complete {progress.target} times this{" "}
              {goalPeriod === "weekly" ? "week" : "month"}
            </p>
          </div>
        </div>
        <button
          onClick={handleRemoveGoal}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Remove
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="w-full bg-white rounded-full h-4 overflow-hidden border-2 border-gray-200">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isCompleted
                ? "bg-gradient-to-r from-green-500 to-emerald-600"
                : "bg-gradient-to-r from-blue-500 to-indigo-600"
            }`}
            style={{ width: `${Math.min(progress.percentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold text-gray-900">
          {progress.current}/{progress.target}
          <span className="text-sm text-gray-600 ml-2">
            ({progress.percentage}%)
          </span>
        </span>

        {isCompleted ? (
          <div className="flex items-center gap-2 text-green-600 font-semibold">
            <span>🎉 Goal Completed!</span>
          </div>
        ) : (
          <span className="text-sm text-gray-600">
            {progress.remaining} more to go! 💪
          </span>
        )}
      </div>
    </div>
  );
}
