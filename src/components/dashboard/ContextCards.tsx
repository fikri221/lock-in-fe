import { Habit } from "@/types/habits";
import { Weather } from "@/types/weather";
import { Cloud, Calendar, TrendingUp, Zap } from "lucide-react";

interface ContextCardsProps {
  weather: Weather | null;
  habits: Habit[];
  completionRate: number;
}

export default function ContextCards({
  weather,
  habits,
  completionRate,
}: ContextCardsProps) {
  const now = new Date();
  const currentHour = now.getHours();
  const greeting =
    currentHour < 12
      ? "Good Morning"
      : currentHour < 18
      ? "Good Afternoon"
      : "Good Evening";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Weather Card */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-blue-100 text-sm font-medium mb-1">
              Today&apos;s Weather
            </p>
            <p className="text-3xl font-bold">{weather?.temp || "--"}°C</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Cloud className="w-7 h-7" />
          </div>
        </div>
        <p className="text-blue-100 capitalize">
          {weather?.description || "Loading..."}
        </p>
        <div className="mt-3 pt-3 border-t border-white/20">
          <p className="text-xs text-blue-100">
            Perfect for outdoor activities! 🌤️
          </p>
        </div>
      </div>

      {/* Completion Card */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-green-100 text-sm font-medium mb-1">
              Completion Rate
            </p>
            <p className="text-3xl font-bold">{completionRate}%</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <TrendingUp className="w-7 h-7" />
          </div>
        </div>
        <p className="text-green-100">Today&apos;s Progress</p>
        <div className="mt-3 pt-3 border-t border-white/20">
          <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
            <div
              className="bg-white h-full rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Streak Card */}
      <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-orange-100 text-sm font-medium mb-1">
              Best Streak
            </p>
            <p className="text-3xl font-bold">
              {Math.max(...habits.map((h) => h.currentStreak), 0)}
            </p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Zap className="w-7 h-7" />
          </div>
        </div>
        <p className="text-orange-100">Days in a row</p>
        <div className="mt-3 pt-3 border-t border-white/20">
          <p className="text-xs text-orange-100">Keep the momentum going! 🔥</p>
        </div>
      </div>

      {/* Time Card */}
      <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-purple-100 text-sm font-medium mb-1">
              {greeting}
            </p>
            <p className="text-3xl font-bold">
              {now.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Calendar className="w-7 h-7" />
          </div>
        </div>
        <p className="text-purple-100">
          {now.toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
          })}
        </p>
        <div className="mt-3 pt-3 border-t border-white/20">
          <p className="text-xs text-purple-100">
            Time to build great habits! ✨
          </p>
        </div>
      </div>
    </div>
  );
}
