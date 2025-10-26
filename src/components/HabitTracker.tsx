"use client";

import {
  HabitCompletionType,
  HabitTrackerProps,
  HabitViewMode,
} from "@/types/habits";
import { CheckCircle, Clock, X, XCircle, Zap } from "lucide-react";
import React, { useState } from "react";
import Header from "./Header";
import AddHabitModal from "./AddHabitModal";
import AddHabitButton from "./AddHabitButton";
import EmptyHabit from "./EmptyHabit";
import InsightsCard from "./InsightsCard";
import DateCard from "./DateCard";
import CompletedHabitCard from "./CompletedHabitCard";

export default function HabitTracker() {
  const [habits, setHabits] = useState<HabitTrackerProps[]>([]);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Header
          setShowAddModal={setShowAddModal}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        {/* Add Habit Modal */}
        {showAddModal && (
          <AddHabitModal
            habits={habits}
            setHabits={setHabits}
            saveData={saveData}
            setShowAddModal={setShowAddModal}
          />
        )}

        {/* Today View */}
        {viewMode === HabitViewMode.TODAY && (
          <div className="space-y-4">
            {habits.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <EmptyHabit />
                <AddHabitButton setShowAddModal={setShowAddModal} />
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
                      <CompletedHabitCard
                        habit={habit}
                        habits={habits}
                        setHabits={setHabits}
                        saveData={saveData}
                        getCompletionIcon={getCompletionIcon}
                        completion={completion}
                        today={today}
                      />
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
              return (
                <DateCard
                  key={habit.id}
                  habit={habit}
                  getCompletionIcon={getCompletionIcon}
                />
              );
            })}
          </div>
        )}

        {/* Insights View */}
        {viewMode === HabitViewMode.INSIGHTS && (
          <div className="space-y-4">
            {habits.map((habit) => {
              return <InsightsCard key={habit.id} habit={habit} />;
            })}
          </div>
        )}
      </div>
    </div>
  );
}
