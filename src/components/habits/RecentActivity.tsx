"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ChevronDown, ChevronUp } from "lucide-react";

interface RecentActivityProps {
  habitId?: string;
  logs?: any[];
}

export default function RecentActivity({}: RecentActivityProps) {
  const [showAll, setShowAll] = useState(false);

  // Mock data for demo - keep using mock data as requested, just styled better
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
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
          <p className="text-sm text-gray-500 mt-1">Your latest check-ins</p>
        </div>
        <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-semibold text-gray-600">
          {mockLogs.length} Entries
        </span>
      </div>

      <div className="relative border-l-2 border-gray-100 ml-4 space-y-8">
        {displayLogs.map((log) => (
          <div key={log.id} className="relative pl-8">
            {/* Timeline dot */}
            <div
              className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white ring-1 ${
                log.status === "completed"
                  ? "bg-green-500 ring-green-100"
                  : log.status === "skipped"
                    ? "bg-orange-400 ring-orange-100"
                    : "bg-gray-300 ring-gray-100"
              }`}
            />

            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 group">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-bold text-gray-900">
                    {format(new Date(log.date), "MMMM dd")}
                  </span>
                  {log.time && (
                    <span className="text-sm text-gray-500 font-medium">
                      {log.time}
                    </span>
                  )}
                  {log.status === "skipped" && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-700">
                      Skipped
                    </span>
                  )}
                </div>

                {log.notes && (
                  <p className="text-gray-600 text-sm mb-3 bg-gray-50 p-3 rounded-xl rounded-tl-none inline-block">
                    &quot;{log.notes}&quot;
                  </p>
                )}

                {(log.mood || log.energy) && (
                  <div className="flex items-center gap-4 text-sm">
                    {log.mood && (
                      <div className="flex items-center gap-1.5 text-gray-600 bg-gray-50 px-2 py-1 rounded-lg">
                        <span>Mood:</span>
                        <span className="text-base">
                          {getMoodEmoji(log.mood)}
                        </span>
                      </div>
                    )}
                    {log.energy && (
                      <div className="flex items-center gap-1.5 text-gray-600 bg-gray-50 px-2 py-1 rounded-lg">
                        <span>Energy:</span>
                        <span className="text-amber-500 text-base">⚡</span>
                        <span className="font-medium">{log.energy}/5</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right side: Weather or Status Icon */}
              <div className="flex items-center gap-3">
                {log.weather && (
                  <div className="text-center bg-blue-50/50 p-2 rounded-xl min-w-[60px]">
                    <div className="text-xl">
                      {getWeatherIcon(log.weather.condition)}
                    </div>
                    <div className="text-xs font-medium text-gray-600 mt-1">
                      {log.weather.temp}°
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Show More/Less Button */}
      {mockLogs.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-8 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl font-medium text-gray-600 transition-colors flex items-center justify-center gap-2"
        >
          {showAll ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              View All History
            </>
          )}
        </button>
      )}
    </div>
  );
}
