"use client";

import { useState } from "react";
import { HabitCharts } from "@/components/charts";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ChartsTestPage() {
  // Use a test habitId - replace with actual habit ID from your database
  const [habitId, setHabitId] = useState(
    "4a25ff6c-96e5-41c6-ac4b-4cc7abd8f78e",
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h1 className="text-3xl font-bold text-gray-900">
              Habit Analytics
            </h1>
            <p className="text-gray-600 mt-2">
              Comprehensive insights into your habit progress
            </p>

            {/* Habit ID input for testing */}
            <div className="mt-4 flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">
                Habit ID:
              </label>
              <input
                type="text"
                value={habitId}
                onChange={(e) => setHabitId(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter habit ID"
              />
            </div>
          </div>
        </div>

        {/* Charts */}
        {habitId && <HabitCharts habitId={habitId} />}
      </div>
    </div>
  );
}
