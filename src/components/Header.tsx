import { HabitViewMode } from "@/types/habits";
import { Plus } from "lucide-react";
import React from "react";

interface HeaderProps {
  setShowAddModal: (show: boolean) => void;
  viewMode: HabitViewMode;
  setViewMode: (mode: HabitViewMode) => void;
}

export default function Header({
  setShowAddModal,
  viewMode,
  setViewMode,
}: HeaderProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Habit Tracker</h1>
          <p className="text-gray-600 mt-1">
            Yang bekerja dengan hidupmu, bukan melawannya
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition"
        >
          <Plus className="w-5 h-5" />
          Habit Baru
        </button>
      </div>

      {/* View Mode Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setViewMode(HabitViewMode.TODAY)}
          className={`px-4 py-2 rounded-lg transition ${
            viewMode === HabitViewMode.TODAY
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Hari Ini
        </button>
        <button
          onClick={() => setViewMode(HabitViewMode.CALENDAR)}
          className={`px-4 py-2 rounded-lg transition ${
            viewMode === HabitViewMode.CALENDAR
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          7 Hari Terakhir
        </button>
        <button
          onClick={() => setViewMode(HabitViewMode.INSIGHTS)}
          className={`px-4 py-2 rounded-lg transition ${
            viewMode === HabitViewMode.INSIGHTS
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Insights
        </button>
      </div>
    </div>
  );
}
