import { HabitCompletionType, HabitTrackerProps } from "@/types/habits";
import { TrendingUp } from "lucide-react";
import React from "react";

interface InsightsCardProps {
  habit: HabitTrackerProps;
}

export default function InsightsCard({ habit }: InsightsCardProps) {
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

  const stats = getStats(habit);

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

  const message = getEncouragingMessage(stats);

  return (
    <div key={habit.id} className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">{habit.name}</h3>

      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 mb-4">
        <p className="text-lg font-medium text-gray-800">{message}</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600">{stats.full}</div>
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
          <span className="font-medium text-gray-700">30-Day Stats</span>
        </div>
        <div className="text-sm text-gray-600 space-y-1">
          <p>
            Engaged days: {stats.full + stats.partial}/30 (
            {stats.engagementRate}%)
          </p>
          <p className="text-xs text-gray-500 mt-2">
            💡 Konsistensi bukan tentang perfect streak. Yang penting terus
            engage!
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
}
