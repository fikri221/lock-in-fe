"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ChevronDown, ChevronUp } from "lucide-react";

interface RecentActivityProps {
  habitId: string;
  logs: any[];
}

export default function RecentActivity({ habitId, logs }: RecentActivityProps) {
  const [showAll, setShowAll] = useState(false);

  // Mock data for demo - replace with real logs
  const mockLogs = [
    {
      id: "1",
      date: "2024-12-10",
      time: "06:15 AM",
      status: "completed",
      mood: 5,
      energy: 5,
      notes: "Felt amazing! Best run this week",
      weather: { condition: "Clear", temp: 22 },
    },
    {
      id: "2",
      date: "2024-12-09",
      time: "06:30 AM",
      status: "completed",
      mood: 3,
      energy: 2,
      notes: "Tired but pushed through",
      weather: { condition: "Cloudy", temp: 20 },
    },
    {
      id: "3",
      date: "2024-12-08",
      time: null,
      status: "skipped",
      mood: null,
      energy: null,
      notes: "Heavy rain",
      weather: { condition: "Rain", temp: 18 },
    },
    {
      id: "4",
      date: "2024-12-07",
      time: "06:00 AM",
      status: "completed",
      mood: 4,
      energy: 4,
      notes: "Good pace today",
      weather: { condition: "Clear", temp: 21 },
    },
    {
      id: "5",
      date: "2024-12-06",
      time: "06:45 AM",
      status: "completed",
      mood: 4,
      energy: 3,
      notes: "Started late but finished strong",
      weather: { condition: "Partly Cloudy", temp: 23 },
    },
  ];

  const displayLogs = showAll ? mockLogs : mockLogs.slice(0, 5);

  const getMoodEmoji = (mood: number | null) => {
    if (!mood) return null;
    const emojis = ["😢", "😕", "😐", "🙂", "😊"];
    return emojis[mood - 1];
  };

  const getWeatherIcon = (condition: string) => {
    const icons: { [key: string]: string } = {
      Clear: "☀️",
      Cloudy: "☁️",
      "Partly Cloudy": "⛅",
      Rain: "🌧️",
      Storm: "⛈️",
    };
    return icons[condition] || "🌤️";
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
        <span className="text-sm text-gray-500">
          {mockLogs.length} total logs
        </span>
      </div>

      <div className="space-y-4">
        {displayLogs.map((log) => (
          <div
            key={log.id}
            className={`p-4 rounded-xl border-2 transition-all ${
              log.status === "completed"
                ? "bg-green-50 border-green-200 hover:border-green-300"
                : log.status === "skipped"
                ? "bg-orange-50 border-orange-200 hover:border-orange-300"
                : "bg-gray-50 border-gray-200 hover:border-gray-300"
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-bold text-gray-900">
                    {format(new Date(log.date), "MMMM dd, yyyy")}
                  </span>
                  {log.time && (
                    <span className="text-sm text-gray-600">• {log.time}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                      log.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : log.status === "skipped"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {log.status === "completed" ? "✓ Completed" : "✗ Skipped"}
                  </span>
                </div>
              </div>

              {log.weather && (
                <div className="text-right text-sm">
                  <div className="text-2xl mb-1">
                    {getWeatherIcon(log.weather.condition)}
                  </div>
                  <span className="text-gray-600">{log.weather.temp}°C</span>
                </div>
              )}
            </div>

            {/* Mood & Energy */}
            {log.mood && log.energy && (
              <div className="flex items-center gap-4 mb-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Mood:</span>
                  <span className="text-lg">{getMoodEmoji(log.mood)}</span>
                  <span className="font-medium text-gray-700">
                    {log.mood}/5
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Energy:</span>
                  <span className="text-lg">⚡</span>
                  <span className="font-medium text-gray-700">
                    {log.energy}/5
                  </span>
                </div>
              </div>
            )}

            {/* Notes */}
            {log.notes && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <p className="text-sm text-gray-700 italic">{log.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Show More/Less Button */}
      {mockLogs.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-4 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition-colors flex items-center justify-center gap-2"
        >
          {showAll ? (
            <>
              <ChevronUp className="w-5 h-5" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="w-5 h-5" />
              View All History ({mockLogs.length} logs)
            </>
          )}
        </button>
      )}
    </div>
  );
}
