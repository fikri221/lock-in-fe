"use client";

import { useState } from "react";
import { Target, Plus, X } from "lucide-react";

interface GoalProgressProps {
  habitId: string;
}

export default function GoalProgress({ habitId }: GoalProgressProps) {
  const [hasGoal, setHasGoal] = useState(true); // Mock: user has goal
  const [isSettingGoal, setIsSettingGoal] = useState(false);
  const [goalValue, setGoalValue] = useState(5);

  // Mock data - replace with API
  const currentProgress = 4;
  const goalTarget = 5;
  const progressPercentage = (currentProgress / goalTarget) * 100;

  if (!hasGoal && !isSettingGoal) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-blue-600" />
            <div>
              <h3 className="font-bold text-gray-900">Set a Weekly Goal</h3>
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

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            How many times per week?
          </label>
          <input
            type="number"
            min="1"
            max="7"
            value={goalValue}
            onChange={(e) => setGoalValue(parseInt(e.target.value))}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              setHasGoal(true);
              setIsSettingGoal(false);
            }}
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
  const remaining = Math.max(0, goalTarget - currentProgress);
  const isCompleted = currentProgress >= goalTarget;

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
            <h3 className="font-bold text-gray-900 text-lg">Weekly Goal</h3>
            <p className="text-sm text-gray-600">
              Complete {goalTarget} times this week
            </p>
          </div>
        </div>
        <button
          onClick={() => setHasGoal(false)}
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
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold text-gray-900">
          {currentProgress}/{goalTarget}
          <span className="text-sm text-gray-600 ml-2">
            ({progressPercentage.toFixed(0)}%)
          </span>
        </span>

        {isCompleted ? (
          <div className="flex items-center gap-2 text-green-600 font-semibold">
            <span>🎉 Goal Completed!</span>
          </div>
        ) : (
          <span className="text-sm text-gray-600">
            {remaining} more to go! 💪
          </span>
        )}
      </div>
    </div>
  );
}
