import { CreateHabitRequest } from "@/types/habits";
import { X, Sparkles, LockKeyholeIcon } from "lucide-react";
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

export default function HabitForm({ onClose, onSubmit }: HabitFormProps) {
  const [formData, setFormData] = useState<CreateHabitRequest>({
    name: "",
    description: "",
    type: "OTHER",
    icon: "⭐",
    color: "#6b7280",
    scheduledTime: "",
    isWeatherDependent: false,
    requiresGoodWeather: false,
    isActive: true,
  });

  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSubmit(formData);
  };

  const handleTypeChange = (type: string) => {
    const selected = HABIT_TYPES.find((t) => t.value === type);
    if (selected) {
      setFormData({
        ...formData,
        type,
        icon: selected.icon,
        color: selected.color,
      });
    }
  };

  const handleSuggestionClick = (suggestion: (typeof POPULAR_HABITS)[0]) => {
    const selectedType = HABIT_TYPES.find((t) => t.value === suggestion.type);
    setFormData({
      ...formData,
      name: suggestion.name,
      type: suggestion.type,
      icon: suggestion.icon,
      color: selectedType?.color || "#6b7280",
      scheduledTime: suggestion.time,
    });
    setShowSuggestions(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-5 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <LockKeyholeIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Create New Habit
              </h2>
              <p className="text-blue-100 text-sm">
                Build a better you, one habit at a time
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Popular Habits Suggestions */}
          {showSuggestions && !formData.name && (
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-5 border border-purple-200">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900">Quick Start</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Choose from popular habits:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {POPULAR_HABITS.map((habit, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSuggestionClick(habit)}
                    className="flex items-center gap-2 px-4 py-3 bg-white hover:bg-purple-50 border border-gray-200 hover:border-purple-300 rounded-lg transition-all text-left"
                  >
                    <span className="text-2xl">{habit.icon}</span>
                    <span className="text-sm font-medium text-gray-700">
                      {habit.name}
                    </span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setShowSuggestions(false)}
                className="text-sm text-purple-600 hover:text-purple-700 mt-3 font-medium"
              >
                or create custom habit →
              </button>
            </div>
          )}

          {/* Icon and Name Row */}
          <div className="flex gap-4">
            {/* Icon */}
            <div className="w-32 relative z-10">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Icon
              </label>
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="w-full h-[50px] border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all flex items-center justify-center text-2xl hover:bg-gray-50 bg-white"
              >
                {formData.icon || "⭐"}
              </button>

              {showEmojiPicker && (
                <div className="absolute top-full left-0 mt-2 z-30">
                  <div
                    className="absolute inset-0"
                    onClick={() => setShowEmojiPicker(false)}
                  />

                  <div className="relative shadow-xl rounded-xl bg-white">
                    <EmojiPicker
                      onEmojiClick={(emojiData) => {
                        setFormData({ ...formData, icon: emojiData.emoji });
                        setShowEmojiPicker(false);
                      }}
                      width={300}
                      height={400}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Habit Name */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Habit Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Morning Run, Read Book, Meditation"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                required
                autoFocus
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="What's this habit about? Add details or goals..."
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
            />
          </div>

          {/* Habit Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Category *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {HABIT_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleTypeChange(type.value)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.type === type.value
                      ? "border-blue-500 bg-blue-50 shadow-md scale-105"
                      : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                  }`}
                  style={{
                    borderColor:
                      formData.type === type.value ? type.color : undefined,
                    backgroundColor:
                      formData.type === type.value
                        ? type.color + "15"
                        : undefined,
                  }}
                >
                  <div className="text-3xl mb-2">{type.icon}</div>
                  <div className="text-sm font-semibold text-gray-900 mb-1">
                    {type.label}
                  </div>
                  <div className="text-xs text-gray-500">
                    {type.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Scheduled Time */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Scheduled Time (Optional)
            </label>
            <div className="relative">
              <input
                type="time"
                value={formData.scheduledTime}
                onChange={(e) =>
                  setFormData({ ...formData, scheduledTime: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Set a reminder time for this habit
            </p>
          </div>

          {/* Weather Options */}
          <div className="space-y-3 bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 text-sm">
              Smart Features
            </h3>

            <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 cursor-pointer transition-all">
              <input
                type="checkbox"
                checked={formData.isWeatherDependent}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    isWeatherDependent: e.target.checked,
                    requiresGoodWeather: e.target.checked
                      ? formData.requiresGoodWeather
                      : false,
                  })
                }
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 mt-0.5"
              />
              <div>
                <div className="font-medium text-gray-900">
                  Weather Dependent
                </div>
                <div className="text-sm text-gray-600">
                  This habit is affected by weather conditions
                </div>
              </div>
            </label>

            {formData.isWeatherDependent && (
              <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 cursor-pointer transition-all ml-8">
                <input
                  type="checkbox"
                  checked={formData.requiresGoodWeather}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      requiresGoodWeather: e.target.checked,
                    })
                  }
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 mt-0.5"
                />
                <div>
                  <div className="font-medium text-gray-900">
                    Requires Good Weather
                  </div>
                  <div className="text-sm text-gray-600">
                    Get alerts when weather is not suitable
                  </div>
                </div>
              </label>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.name.trim()}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Create Habit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
