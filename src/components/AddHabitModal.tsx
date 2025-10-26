"use client";

import { HabitFrequency, HabitTrackerProps } from "@/types/habits";
import { Heart, X } from "lucide-react";
import React, { useState } from "react";

interface AddHabitModalProps {
  habits: HabitTrackerProps[];
  setHabits: (habit: HabitTrackerProps[]) => void;
  saveData: (habits: HabitTrackerProps[]) => void;
  setShowAddModal: (show: boolean) => void;
}

export default function AddHabitModal({
  habits,
  setHabits,
  saveData,
  setShowAddModal,
}: AddHabitModalProps) {
  const [newHabit, setNewHabit] = useState<HabitTrackerProps>({
    id: "",
    name: "",
    why: "",
    minDuration: 0,
    idealDuration: 0,
    frequency: HabitFrequency.DAILY,
    customDays: [],
    completions: {},
  });

  const addHabit = () => {
    if (newHabit.name.trim() === "") {
      alert("Habit name cannot be empty!");
      return;
    }

    const habit = {
      ...newHabit,
      id: Date.now().toString(),
      completions: {},
      createdAt: new Date().toISOString(),
    };

    const updatedHabits = [...habits, habit];
    setHabits(updatedHabits);
    saveData(updatedHabits);
    setNewHabit({
      id: "",
      name: "",
      why: "",
      minDuration: 0,
      idealDuration: 0,
      frequency: HabitFrequency.DAILY,
      customDays: [],
      completions: {},
    });
    setShowAddModal(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Habit Baru</h2>
          <button
            onClick={() => setShowAddModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Habit
            </label>
            <input
              type="text"
              value={newHabit.name}
              onChange={(e) =>
                setNewHabit({ ...newHabit, name: e.target.value })
              }
              placeholder="Contoh: Baca buku"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" />
              Kenapa ini penting buatmu?
            </label>
            <textarea
              value={newHabit.why}
              onChange={(e) =>
                setNewHabit({ ...newHabit, why: e.target.value })
              }
              placeholder="Ini akan jadi motivasi ketika kamu skip..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum (menit)
              </label>
              <input
                type="number"
                value={newHabit.minDuration}
                onChange={(e) =>
                  setNewHabit({
                    ...newHabit,
                    minDuration: parseInt(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Ketika sibuk</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ideal (menit)
              </label>
              <input
                type="number"
                value={newHabit.idealDuration}
                onChange={(e) =>
                  setNewHabit({
                    ...newHabit,
                    idealDuration: parseInt(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Target normalmu</p>
            </div>
          </div>

          <button
            onClick={addHabit}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-medium"
          >
            Tambahkan Habit
          </button>
        </div>
      </div>
    </div>
  );
}
