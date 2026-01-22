"use client";

import { useState } from "react";
import { Target, Plus, X } from "lucide-react";

// interface GoalProgressProps {
//   habitId: string;
// }

export default function GoalProgress({}: { habitId?: string }) {
  const [hasGoal, setHasGoal] = useState(true); // Mock: user has goal
  const [isSettingGoal, setIsSettingGoal] = useState(false);
  const [goalValue, setGoalValue] = useState(5);

  // Mock data - replace with API
  const currentProgress = 4;
  const goalTarget = 5;
  const progressPercentage = (currentProgress / goalTarget) * 100;

  if (!hasGoal && !isSettingGoal) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-100/50 hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-2xl shadow-sm text-blue-600">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">
                Set a Weekly Goal
              </h3>
              <p className="text-sm text-gray-600">
                Challenge yourself to stay consistent!
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSettingGoal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 font-medium"
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
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-gray-900 text-lg">
            Set Your Weekly Goal
          </h3>
          <button
            onClick={() => setIsSettingGoal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            How many times per week?
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max="7"
              value={goalValue}
              onChange={(e) => setGoalValue(parseInt(e.target.value))}
              className="w-full accent-blue-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-2xl font-bold text-blue-600 w-8">
              {goalValue}
            </span>
          </div>
          <p className="text-xs text-center mt-2 text-gray-500">
            Days per week
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              setHasGoal(true);
              setIsSettingGoal(false);
            }}
            className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-all shadow-lg shadow-blue-100"
          >
            Save Goal
          </button>
          <button
            onClick={() => setIsSettingGoal(false)}
            className="px-6 py-3 border-2 border-gray-100 rounded-xl hover:bg-gray-50 font-semibold transition-colors text-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Show goal progress
  const remaining = Math.max(0, goalTarget - currentProgress);
  const isCompleted = currentProgress >= goalTarget;

  return (
    <div
      className={`rounded-3xl p-8 border hover:shadow-md transition-all group ${
        isCompleted
          ? "bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-100"
          : "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100"
      }`}
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div
            className={`p-3 rounded-2xl shadow-sm ${
              isCompleted
                ? "bg-white text-emerald-600"
                : "bg-white text-blue-600"
            }`}
          >
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Weekly Goal</h3>
            <p className="text-sm text-gray-600 font-medium">
              Complete {goalTarget} times this week
            </p>
          </div>
        </div>
        <button
          onClick={() => setHasGoal(false)}
          className="text-xs font-semibold text-gray-400 hover:text-gray-600 uppercase tracking-wider"
        >
          Remove
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="w-full bg-white/60 rounded-full h-5 overflow-hidden backdrop-blur-sm">
          <div
            className={`h-full transition-all duration-1000 ease-out rounded-full shadow-sm ${
              isCompleted
                ? "bg-gradient-to-r from-emerald-500 to-green-500"
                : "bg-gradient-to-r from-blue-500 to-indigo-500"
            }`}
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-gray-900">
            {currentProgress}
          </span>
          <span className="text-gray-500 font-medium">/{goalTarget} days</span>
        </div>

        {isCompleted ? (
          <div className="flex items-center gap-2 text-emerald-700 font-bold bg-emerald-100/50 px-3 py-1 rounded-lg">
            <span>🎉 Goal Met!</span>
          </div>
        ) : (
          <span className="text-sm font-medium text-blue-700 bg-blue-100/50 px-3 py-1 rounded-lg">
            {remaining} more to go! 💪
          </span>
        )}
      </div>
    </div>
  );
}
