import { CreateHabitRequest, HabitFrequency } from "@/types/habits";
import { X, Sparkles } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import { useState } from "react";

interface HabitFormProps {
  onClose: () => void;
  onSubmit: (habit: CreateHabitRequest) => void;
}

const HABIT_TYPES = [
  {
    value: "OUTDOOR",
    label: "Outdoor",
    icon: "🏃",
    color: "#10b981",
    description: "Exercise, sports, nature",
  },
  {
    value: "WORK",
    label: "Work",
    icon: "💻",
    color: "#3b82f6",
    description: "Career, productivity",
  },
  {
    value: "HEALTH",
    label: "Health",
    icon: "❤️",
    color: "#ef4444",
    description: "Wellness, diet, sleep",
  },
  {
    value: "LEARNING",
    label: "Learning",
    icon: "📚",
    color: "#8b5cf6",
    description: "Study, skills, reading",
  },
  {
    value: "OTHER",
    label: "Other",
    icon: "⭐",
    color: "#6b7280",
    description: "Everything else",
  },
];

const POPULAR_HABITS = [
  { name: "Morning Exercise", type: "OUTDOOR", icon: "🏃", time: "06:00" },
  { name: "Meditation", type: "HEALTH", icon: "🧘", time: "07:00" },
  { name: "Read Book", type: "LEARNING", icon: "📚", time: "20:00" },
  { name: "Drink Water", type: "HEALTH", icon: "💧", time: "09:00" },
  { name: "Code Practice", type: "WORK", icon: "💻", time: "10:00" },
  { name: "Journal", type: "OTHER", icon: "📝", time: "21:00" },
];

const DAYS_OF_WEEK = [
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
  { label: "Sun", value: 0 },
];

export default function HabitForm({ onClose, onSubmit }: HabitFormProps) {
  const [formData, setFormData] = useState<CreateHabitRequest>({
    name: "",
    description: "",
    category: "OTHER",
    icon: "⭐",
    color: "#6b7280",
    frequency: HabitFrequency.DAILY,
    habitType: "boolean", // 'boolean' or 'measurable'
    targetValue: 0,
    targetCount: 0,
    targetUnit: "",
    targetDays: [],
    allowFlexible: false,
    scheduledTime: undefined,
    isWeatherDependent: false,
    requiresGoodWeather: false,
    reminderEnabled: true,
    isActive: true,
  });

  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    // Clean up data before submit
    const submissionData = { ...formData };

    // Cleanup based on Frequency
    if (submissionData.frequency === HabitFrequency.DAILY) {
      submissionData.targetDays = undefined;
      submissionData.targetCount = undefined; // KEEP targetCount for Daily
      submissionData.allowFlexible = true;
    } else if (submissionData.frequency === HabitFrequency.WEEKLY) {
      if (submissionData.allowFlexible) {
        // Flexible: Keep targetCount, clear targetDays
        submissionData.targetDays = undefined;
      } else {
        // Specific Days: Keep targetDays, set targetCount based on days length for backend consistency
        submissionData.targetCount = submissionData.targetDays?.length || 0;
      }
    }

    if (submissionData.habitType === "boolean") {
      submissionData.targetValue = undefined;
      submissionData.targetUnit = undefined;
    }

    onSubmit(submissionData);
  };

  const toggleDay = (dayValue: number) => {
    const currentDays = formData.targetDays || [];
    const newDays = currentDays.includes(dayValue)
      ? currentDays.filter((d) => d !== dayValue)
      : [...currentDays, dayValue];
    setFormData({
      ...formData,
      targetDays: newDays,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            New Habit
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Quick Suggestions Carousel */}
          {showSuggestions && (
            <div className="overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
              <div className="flex gap-2 w-max">
                {POPULAR_HABITS.map((habit, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      const category = HABIT_TYPES.find(
                        (t) => t.value === habit.type,
                      );
                      setFormData({
                        ...formData,
                        name: habit.name,
                        icon: habit.icon,
                        category: habit.type,
                        color: category?.color || "#6b7280",
                      });
                      setShowSuggestions(false);
                    }}
                    className="flex items-center gap-2 px-3 py-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/50 hover:bg-amber-50/50 dark:hover:bg-amber-900/10 transition-all text-sm whitespace-nowrap"
                  >
                    <span>{habit.icon}</span>
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                      {habit.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Name & Icon */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              What do you want to do?
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="w-12 h-12 flex items-center justify-center text-2xl bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 transition-colors shrink-0"
              >
                {formData.icon}
              </button>
              <input
                type="text"
                placeholder="e.g. Read 30 mins"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="flex-1 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                autoFocus
              />
            </div>
            {showEmojiPicker && (
              <div className="absolute z-10 mt-2">
                <div
                  className="fixed inset-0 z-0"
                  onClick={() => setShowEmojiPicker(false)}
                />
                <div className="relative z-10">
                  <EmojiPicker
                    onEmojiClick={(emoji) => {
                      setFormData({ ...formData, icon: emoji.emoji });
                      setShowEmojiPicker(false);
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Type
              </label>
              <select
                value={formData.habitType}
                onChange={(e) =>
                  setFormData({ ...formData, habitType: e.target.value })
                }
                className="w-full h-10 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 text-sm focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none"
              >
                <option value="boolean">Yes/No Completion</option>
                <option value="measurable">Measurable (e.g. 5km)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Frequency
              </label>
              <select
                value={formData.frequency}
                onChange={(e) =>
                  setFormData({ ...formData, frequency: e.target.value })
                }
                className="w-full h-10 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 text-sm focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none"
              >
                <option value={HabitFrequency.DAILY}>Daily</option>
                <option value={HabitFrequency.WEEKLY}>Weekly</option>
              </select>
            </div>
          </div>

          {formData.habitType === "measurable" && (
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700 animate-in slide-in-from-top-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Goal Target
              </label>
              <div className="flex gap-3">
                <div className="flex-1">
                  <input
                    type="number"
                    placeholder="Value"
                    value={formData.targetValue}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        targetValue: Number(e.target.value),
                      })
                    }
                    className="w-full h-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 focus:ring-2 focus:ring-zinc-900 outline-none"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Unit (e.g. min, km)"
                    value={formData.targetUnit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        targetUnit: e.target.value,
                      })
                    }
                    className="w-full h-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 focus:ring-2 focus:ring-zinc-900 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {formData.frequency === HabitFrequency.WEEKLY && (
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Weekly Schedule
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allowFlexible}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        allowFlexible: e.target.checked,
                        targetDays: e.target.checked ? [] : formData.targetDays,
                      })
                    }
                    className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                  />
                  <span className="text-xs text-zinc-500">Flexible?</span>
                </label>
              </div>

              {formData.allowFlexible ? (
                <div>
                  <label className="text-xs text-zinc-500 mb-1.5 block">
                    Times per week
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={7}
                    value={formData.targetCount || 1}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        targetCount: Number(e.target.value),
                      })
                    }
                    className="w-full h-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3"
                  />
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDay(day.value)}
                      className={`w-9 h-9 rounded-lg text-xs font-medium transition-all ${
                        (formData.targetDays || []).includes(day.value)
                          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                          : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-400"
                      }`}
                    >
                      {day.label.slice(0, 1)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {HABIT_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      category: type.value,
                      color: type.color,
                      icon: formData.icon === "⭐" ? type.icon : formData.icon,
                    })
                  }
                  className={`flex items-center gap-2 p-2 rounded-lg border text-sm transition-all ${
                    formData.category === type.value
                      ? "border-zinc-900 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                      : "border-zinc-200 bg-white dark:bg-zinc-800 dark:border-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  <span className="text-base">{type.icon}</span>
                  <span className="truncate">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${formData.reminderEnabled ? "bg-amber-100 text-amber-600" : "bg-zinc-200 text-zinc-500"}`}
              >
                <span className="text-lg">🔔</span>
              </div>
              <div className="text-sm">
                <div className="font-medium text-zinc-900 dark:text-zinc-100">
                  Reminders
                </div>
                {formData.reminderEnabled && (
                  <input
                    type="time"
                    value={formData.scheduledTime || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        scheduledTime: e.target.value,
                      })
                    }
                    className="bg-transparent text-xs text-zinc-500 outline-none border-b border-zinc-300 border-dashed w-16"
                  />
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                setFormData({
                  ...formData,
                  reminderEnabled: !formData.reminderEnabled,
                })
              }
              className={`relative w-11 h-6 rounded-full transition-colors ${formData.reminderEnabled ? "bg-zinc-900 dark:bg-zinc-100" : "bg-zinc-200 dark:bg-zinc-700"}`}
            >
              <div
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${formData.reminderEnabled ? "translate-x-5" : "translate-x-0"}`}
              />
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 font-medium transition-all text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.name.trim()}
              className="flex-1 px-4 py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Create Habit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
