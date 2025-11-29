// src/components/dashboard/SmartSuggestions.tsx
import { Habit } from "@/types/habits";
import { Weather } from "@/types/weather";
import { Lightbulb, Clock, AlertCircle, CheckCircle } from "lucide-react";

interface SmartSuggestionsProps {
  habits: Habit[];
  weather: Weather | null;
}

export default function SmartSuggestions({
  habits,
  weather,
}: SmartSuggestionsProps) {
  const suggestions = [];

  // Weather-based suggestions
  const outdoorHabits = habits.filter((h) => h.isWeatherDependent);
  if (outdoorHabits.length > 0 && weather) {
    if (weather.condition === "Clear" || weather.condition === "Clouds") {
      suggestions.push({
        icon: <CheckCircle className="w-5 h-5 text-green-600" />,
        type: "success",
        title: "Perfect weather for outdoor habits!",
        description: `${
          weather.temp
        }°C and ${weather.condition.toLowerCase()} - Great time for your outdoor activities.`,
        action: "View outdoor habits",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
      });
    } else if (weather.condition === "Rain") {
      suggestions.push({
        icon: <AlertCircle className="w-5 h-5 text-orange-600" />,
        type: "warning",
        title: "Rainy weather alert",
        description:
          "Consider indoor alternatives for your outdoor habits today.",
        action: "See alternatives",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
      });
    }
  }

  // Time-based suggestions
  const now = new Date();
  const upcomingHabits = habits.filter((h) => {
    if (!h.scheduledTime) return false;
    const [hour, minute] = h.scheduledTime.split(":").map(Number);
    const habitTime = new Date();
    habitTime.setHours(hour, minute, 0);
    const diff = habitTime.getTime() - now.getTime();
    return diff > 0 && diff < 60 * 60 * 1000; // Within 1 hour
  });

  if (upcomingHabits.length > 0) {
    suggestions.push({
      icon: <Clock className="w-5 h-5 text-blue-600" />,
      type: "info",
      title: "Upcoming habits",
      description: `You have ${upcomingHabits.length} habit(s) scheduled in the next hour.`,
      action: "Prepare now",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    });
  }

  // Pattern-based suggestions
  const highStreakHabits = habits.filter((h) => h.currentStreak >= 7);
  if (highStreakHabits.length > 0) {
    suggestions.push({
      icon: <Lightbulb className="w-5 h-5 text-purple-600" />,
      type: "insight",
      title: "Amazing streaks!",
      description: `You have ${highStreakHabits.length} habit(s) with 7+ day streaks. Keep it up!`,
      action: "View all",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    });
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-yellow-600" />
        <h2 className="text-lg font-semibold text-gray-900">
          Smart Suggestions
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className={`${suggestion.bgColor} border ${suggestion.borderColor} rounded-xl p-5 hover:shadow-md transition-shadow`}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="mt-0.5">{suggestion.icon}</div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {suggestion.title}
                </h3>
                <p className="text-sm text-gray-700">
                  {suggestion.description}
                </p>
              </div>
            </div>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
              {suggestion.action} →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
