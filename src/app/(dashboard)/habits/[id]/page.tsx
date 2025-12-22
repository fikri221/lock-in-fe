// frontend/src/app/habits/[id]/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Edit2,
  Trash2,
  Download,
  MoreVertical,
  Target,
  Flame,
  TrendingUp,
  Award,
  Clock,
  X,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { useHabits } from "@/hooks/useHabits";
// import HabitChart from "@/components/habits/HabitChart";
// import HabitHeatmap from "@/components/habits/HabitHeatmap";
import GoalProgress from "@/components/habits/GoalProgress";
import RecentActivity from "@/components/habits/RecentActivity";
import { LogCompletion, LogCompletionType } from "@/types/habits";

// type TimeRange = "7" | "30" | "90" | "all";

export default function HabitDetailPage() {
  const router = useRouter();
  const params = useParams();
  const habitId = params.id as string;

  const { habits, loading, deleteHabit, updateHabit } = useHabits();
  // Derive habit directly instead of using local state to avoid infinite loops
  const habit = useMemo(
    () => habits.find((h) => h.id === habitId),
    [habits, habitId]
  );

  // const [timeRange, setTimeRange] = useState<TimeRange>("7");
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedTime, setEditedTime] = useState("");

  // Handle habit not found and form initialization
  useEffect(() => {
    if (!loading) {
      if (!habit) {
        toast.error("Habit not found");
        router.push("/");
      } else if (!isEditing) {
        // Initialize form state when habit loads/changes, but only if not currently editing
        // Only update state if values are actually different to prevent infinite loops
        if (editedName !== habit.name) setEditedName(habit.name);
        if (editedDescription !== (habit.description || ""))
          setEditedDescription(habit.description || "");
        if (editedTime !== (habit.scheduledTime || ""))
          setEditedTime(habit.scheduledTime || "");
      }
    }
  }, [
    habit,
    loading,
    router,
    isEditing,
    editedName,
    editedDescription,
    editedTime,
  ]);

  const handleComplete = async () => {
    try {
      // await completeHabit(habitId);
      toast.success("Habit completed! 🎉");
    } catch (error) {
      console.error("Error completing habit:", error);
    }
  };

  const handleDelete = async () => {
    if (
      confirm(
        "Are you sure you want to delete this habit? This cannot be undone."
      )
    ) {
      try {
        await deleteHabit(habitId);
        toast.success("Habit deleted");
        router.push("/");
      } catch (error) {
        console.error("Error deleting habit:", error);
      }
    }
  };

  const handleSaveEdit = async () => {
    try {
      await updateHabit(habitId, {
        name: editedName,
        description: editedDescription,
        scheduledTime: editedTime,
      });
      setIsEditing(false);
      toast.success("Habit updated!");
    } catch (error) {
      console.error("Error updating habit:", error);
    }
  };

  const handleExport = () => {
    // TODO: Implement CSV export
    toast.info("Export feature coming soon!");
  };

  const isCompleted = habit?.logs?.some(
    (l: LogCompletion) => l.status === LogCompletionType.COMPLETED
  );

  if (loading || !habit) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading habit details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Dashboard</span>
          </button>

          <div className="flex items-start justify-between">
            {/* Habit Info */}
            <div className="flex items-start gap-4 flex-1">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg"
                style={{
                  backgroundColor: habit.color + "25",
                  border: `3px solid ${habit.color}`,
                }}
              >
                {habit.icon}
              </div>

              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="text-2xl font-bold text-gray-900 border-2 border-blue-500 rounded-lg px-3 py-2 w-full"
                      placeholder="Habit name"
                    />
                    <textarea
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      className="text-gray-600 border-2 border-blue-500 rounded-lg px-3 py-2 w-full"
                      placeholder="Description (optional)"
                      rows={2}
                    />
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <input
                        type="time"
                        value={editedTime}
                        onChange={(e) => setEditedTime(e.target.value)}
                        className="border-2 border-blue-500 rounded-lg px-3 py-2"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveEdit}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditedName(habit.name);
                          setEditedDescription(habit.description || "");
                          setEditedTime(habit.scheduledTime || "");
                        }}
                        className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {habit.name}
                    </h1>
                    <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                      <span className="px-2 py-1 bg-gray-100 rounded-lg font-medium">
                        {habit.type}
                      </span>
                      {habit.scheduledTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{habit.scheduledTime}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Flame className="w-4 h-4 text-orange-500" />
                        <span className="font-semibold">
                          {habit.currentStreak} day streak
                        </span>
                      </div>
                    </div>
                    {habit.description && (
                      <p className="text-gray-600 italic">
                        &quot;{habit.description}&quot;
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            {!isEditing && (
              <div className="flex items-center gap-2">
                {!isCompleted && (
                  <button
                    onClick={handleComplete}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
                  >
                    <Check className="w-5 h-5" />
                    <span className="hidden sm:inline">Complete Today</span>
                  </button>
                )}

                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Edit2 className="w-5 h-5" />
                  <span className="hidden sm:inline">Edit</span>
                </button>

                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>

                  {showMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowMenu(false)}
                      />
                      <div className="absolute right-0 top-12 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[160px] z-20">
                        <button
                          onClick={() => {
                            handleExport();
                            setShowMenu(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Export CSV
                        </button>
                        <button
                          onClick={() => {
                            handleDelete();
                            setShowMenu(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Habit
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Flame className="w-6 h-6 text-orange-500" />}
            label="Current Streak"
            value={habit.currentStreak}
            suffix="days"
          />
          <StatCard
            icon={<Target className="w-6 h-6 text-blue-500" />}
            label="Total Done"
            value={habit.totalCompletions}
            suffix="times"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6 text-green-500" />}
            label="30-Day Rate"
            value={80}
            suffix="%"
          />
          <StatCard
            icon={<Award className="w-6 h-6 text-purple-500" />}
            label="Best Streak"
            value={habit.longestStreak}
            suffix="days"
          />
        </div>

        {/* Goal Progress */}
        <GoalProgress habitId={habitId} />

        {/* Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            Statistics temporarily disabled for performance debugging
          </div>
          {/* <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Completion Chart
            </h2>
            <div className="flex gap-2">
              {(["7", "30", "90", "all"] as TimeRange[]).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    timeRange === range
                      ? "bg-blue-500 text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {range === "all" ? "All Time" : `${range} Days`}
                </button>
              ))}
            </div>
          </div>
          <HabitChart
            habitId={habitId}
            days={timeRange === "all" ? 365 : parseInt(timeRange)}
          /> */}
        </div>

        {/* Heatmap */}
        {/* <HabitHeatmap habitId={habitId} /> */}

        {/* Insights */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-purple-600" />
            Insights
          </h2>
          <div className="space-y-3">
            <InsightItem text="Best day: Monday (90% completion)" />
            <InsightItem text="Most consistent: Week 48 (7/7 days)" />
            <InsightItem text="Average per week: 5.2 completions" />
            <InsightItem
              text="You complete this even when tired! 💪"
              highlight
            />
          </div>
        </div>

        {/* Recent Activity */}
        <RecentActivity habitId={habitId} logs={habit.logs || []} />
      </main>
    </div>
  );
}

// Stat Card Component
function StatCard({
  icon,
  label,
  value,
  suffix,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix: string;
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
      </div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900">
        {value}
        <span className="text-lg text-gray-500 ml-1">{suffix}</span>
      </p>
    </div>
  );
}

// Insight Item Component
function InsightItem({
  text,
  highlight,
}: {
  text: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg ${
        highlight
          ? "bg-purple-100 border border-purple-300"
          : "bg-white border border-purple-200"
      }`}
    >
      <span className="text-purple-600 mt-0.5">•</span>
      <p
        className={`text-sm ${
          highlight ? "font-semibold text-purple-900" : "text-gray-700"
        }`}
      >
        {text}
      </p>
    </div>
  );
}
