"use client";

import {
  HabitCompletionType,
  HabitFrequency,
  HabitTrackerProps,
  HabitViewMode,
} from "@/types/habits";
import {
  CheckCircle,
  Clock,
  Heart,
  Plus,
  Target,
  TrendingUp,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import React, { useState } from "react";

export default function HabitTracker() {
  const [habits, setHabits] = useState<HabitTrackerProps[]>([]);
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
  const [selectedHabit, setSelectedHabit] = useState<HabitTrackerProps | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState<HabitViewMode>(HabitViewMode.TODAY);

  const loadData = () => {
    try {
      const storedHabits = localStorage.getItem("habits-data");
      if (storedHabits) {
        setHabits(JSON.parse(storedHabits));
      }
    } catch (error) {
      console.error("Error loading habits from localStorage:", error);
    }
  };

  const saveData = (updatedHabits: HabitTrackerProps[]) => {
    try {
      localStorage.setItem("habits-data", JSON.stringify(updatedHabits));
    } catch (error) {
      console.log("Error saving data: ", error);
    }
  };

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

  const markCompletion = (
    habitId: string,
    date: string,
    type: HabitCompletionType,
    duration: number | null,
    reason: string = ""
  ) => {
    const updatedHabits = habits.map((habit) => {
      if (habit.id === habitId) {
        const completions = { ...habit.completions };
        completions[date] = {
          type,
          duration: duration || 0,
          reason,
          timestamp: new Date().toISOString(),
        };
        return { ...habit, completions };
      }
      return habit;
    });
    setHabits(updatedHabits);
    saveData(updatedHabits);
  };

  const deleteHabit = (id: string) => {
    const updatedHabits = habits.filter((habit) => habit.id !== id);
    setHabits(updatedHabits);
    saveData(updatedHabits);
  };

  const getStats = (habit: HabitTrackerProps) => {
    const last30Days = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      last30Days.push(date.toISOString().split("T")[0]);
    }

    let full = 0;
    let partial = 0;
    let skipped = 0;
    const skipReasons: { [reason: string]: number } = {};

    last30Days.forEach((date) => {
      const completion = habit.completions[date];
      if (completion) {
        if (completion.type === HabitCompletionType.FULL) {
          full++;
        } else if (completion.type === HabitCompletionType.PARTIAL) {
          partial++;
        } else if (completion.type === HabitCompletionType.SKIP) {
          skipped++;
          const reason = completion.reason || "No reason";
          skipReasons[reason] = (skipReasons[reason] || 0) + 1;
        }
      }
    });

    const engagedDays = full + partial;
    const totalTracked = full + partial + skipped;
    const engagementRate =
      totalTracked > 0 ? Math.round((engagedDays / 30) * 100) : 0;

    return { full, partial, skipped, engagementRate, skipReasons, last30Days };
  };

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push({
        date: date.toISOString().split("T")[0],
        dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
        dayNum: date.getDate(),
      });
    }
    return days;
  };

  const getCompletionIcon = (type?: HabitCompletionType) => {
    if (type === HabitCompletionType.FULL) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else if (type === HabitCompletionType.PARTIAL) {
      return <Zap className="w-5 h-5 text-yellow-500" />;
    } else if (type === HabitCompletionType.SKIP) {
      return <XCircle className="w-5 h-5 text-gray-400" />;
    }
    return <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />;
  };

  const getEncouragingMessage = (stats: {
    full: number;
    partial: number;
    skipped: number;
  }) => {
    const total = stats.full + stats.partial + stats.skipped;
    if (total === 0) {
      return "Ayo mulai habit-mu hari ini!";
    } else if (stats.full / total >= 0.7) {
      return "Luar biasa! Kamu konsisten menjalankan habit-mu!";
    } else if ((stats.full + stats.partial) / total >= 0.5) {
      return "Bagus! Terus tingkatkan konsistensimu!";
    } else {
      return "Jangan menyerah! Setiap langkah kecil berarti.";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Habit Tracker
              </h1>
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

        {/* Add Habit Modal */}
        {showAddModal && (
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
                    <p className="text-xs text-gray-500 mt-1">
                      Target normalmu
                    </p>
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
        )}

        {/* Today View */}
        {viewMode === HabitViewMode.TODAY && (
          <div className="space-y-4">
            {habits.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Belum ada habit
                </h3>
                <p className="text-gray-500 mb-4">
                  Mulai dengan menambahkan habit pertamamu!
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                  Tambah Habit
                </button>
              </div>
            ) : (
              habits.map((habit) => {
                const today = new Date().toISOString().split("T")[0];
                const completion = habit.completions[today];

                return (
                  <div
                    key={habit.id}
                    className="bg-white rounded-2xl shadow-lg p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800">
                          {habit.name}
                        </h3>
                        {habit.why && (
                          <p className="text-sm text-gray-600 mt-1 italic">
                            &quot;{habit.why}&quot;
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteHabit(habit.id)}
                        className="text-gray-400 hover:text-red-500 transition"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <Clock className="w-4 h-4" />
                      <span>Minimum: {habit.minDuration} menit</span>
                      <span className="text-gray-400">•</span>
                      <span>Ideal: {habit.idealDuration} menit</span>
                    </div>

                    {!completion ? (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Hari ini:
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() =>
                              markCompletion(
                                habit.id,
                                today,
                                HabitCompletionType.FULL,
                                habit.idealDuration
                              )
                            }
                            className="bg-green-50 border-2 border-green-500 text-green-700 px-4 py-3 rounded-lg hover:bg-green-100 transition font-medium"
                          >
                            ✅ Done ({habit.idealDuration}+ min)
                          </button>
                          <button
                            onClick={() =>
                              markCompletion(
                                habit.id,
                                today,
                                HabitCompletionType.PARTIAL,
                                habit.minDuration
                              )
                            }
                            className="bg-yellow-50 border-2 border-yellow-500 text-yellow-700 px-4 py-3 rounded-lg hover:bg-yellow-100 transition font-medium"
                          >
                            ⚡ Partial ({habit.minDuration}+ min)
                          </button>
                        </div>
                        <button
                          onClick={() => {
                            const reason = prompt(
                              "Kenapa skip? (opsional)\n\nContoh: Capek, Sibuk, Lupa, dll"
                            );
                            markCompletion(
                              habit.id,
                              today,
                              HabitCompletionType.SKIP,
                              null,
                              reason || "No reason"
                            );
                          }}
                          className="w-full bg-gray-50 border-2 border-gray-300 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                        >
                          Skip hari ini
                        </button>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          {getCompletionIcon(completion?.type)}
                          <span className="font-medium text-gray-700">
                            {completion?.type === HabitCompletionType.FULL
                              ? "✅ Selesai!"
                              : completion?.type === HabitCompletionType.PARTIAL
                              ? "⚡ Partial - Tetap bagus!"
                              : "⏭️ Di-skip"}
                          </span>
                        </div>
                        {completion?.duration && (
                          <p className="text-sm text-gray-600">
                            Durasi: {completion.duration} menit
                          </p>
                        )}
                        {completion?.reason &&
                          completion?.type === HabitCompletionType.SKIP && (
                            <p className="text-sm text-gray-600">
                              Alasan: {completion.reason}
                            </p>
                          )}
                        <button
                          onClick={() => {
                            const updatedHabits = habits.map((h) => {
                              if (h.id === habit.id) {
                                const completions = { ...h.completions };
                                delete completions[today];
                                return { ...h, completions };
                              }
                              return h;
                            });
                            setHabits(updatedHabits);
                            saveData(updatedHabits);
                          }}
                          className="text-sm text-indigo-600 hover:text-indigo-700 mt-2"
                        >
                          Ubah status
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Calendar View */}
        {viewMode === HabitViewMode.CALENDAR && (
          <div className="space-y-4">
            {habits.map((habit) => {
              const last7Days = getLast7Days();

              return (
                <div
                  key={habit.id}
                  className="bg-white rounded-2xl shadow-lg p-6"
                >
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    {habit.name}
                  </h3>

                  <div className="grid grid-cols-7 gap-2">
                    {last7Days.map((day) => {
                      const completion = habit.completions[day.date];

                      return (
                        <div key={day.date} className="text-center">
                          <div className="text-xs text-gray-500 mb-1">
                            {day.dayName}
                          </div>
                          <div className="text-xs text-gray-400 mb-2">
                            {day.dayNum}
                          </div>
                          <div className="flex justify-center">
                            {getCompletionIcon(completion?.type)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Insights View */}
        {viewMode === HabitViewMode.INSIGHTS && (
          <div className="space-y-4">
            {habits.map((habit) => {
              const stats = getStats(habit);
              const message = getEncouragingMessage(stats);

              return (
                <div
                  key={habit.id}
                  className="bg-white rounded-2xl shadow-lg p-6"
                >
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    {habit.name}
                  </h3>

                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 mb-4">
                    <p className="text-lg font-medium text-gray-800">
                      {message}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {stats.full}
                      </div>
                      <div className="text-sm text-gray-600">Full Complete</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-600">
                        {stats.partial}
                      </div>
                      <div className="text-sm text-gray-600">Partial</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-400">
                        {stats.skipped}
                      </div>
                      <div className="text-sm text-gray-600">Skipped</div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-indigo-600" />
                      <span className="font-medium text-gray-700">
                        30-Day Stats
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        Engaged days: {stats.full + stats.partial}/30 (
                        {stats.engagementRate}%)
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        💡 Konsistensi bukan tentang perfect streak. Yang
                        penting terus engage!
                      </p>
                    </div>
                  </div>

                  {Object.keys(stats.skipReasons).length > 0 && (
                    <div className="mt-4 bg-amber-50 rounded-lg p-4">
                      <p className="font-medium text-gray-700 mb-2">
                        Alasan Skip Paling Sering:
                      </p>
                      {Object.entries(stats.skipReasons)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 3)
                        .map(([reason, count]) => (
                          <p key={reason} className="text-sm text-gray-600">
                            • {reason}: {count}x
                          </p>
                        ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
