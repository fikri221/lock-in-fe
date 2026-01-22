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

  const { habits, loading, deleteHabit, updateHabit, completeHabit } =
    useHabits(new Date().toDateString());
  // Derive habit directly instead of using local state to avoid infinite loops
  const habit = useMemo(
    () => habits.find((h) => h.id === habitId),
    [habits, habitId],
  );

  // const [timeRange, setTimeRange] = useState<TimeRange>("7");
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedTime, setEditedTime] = useState<string | undefined>(undefined);

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
        if (editedTime !== (habit.scheduledTime?.slice(0, 5) || undefined))
          setEditedTime(habit.scheduledTime?.slice(0, 5) || undefined);
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
      await completeHabit(habitId, {
        status: LogCompletionType.COMPLETED,
      });
      toast.success("Habit completed! 🎉");
    } catch (error) {
      console.error("Error completing habit:", error);
    }
  };

  const handleDelete = async () => {
    if (
      confirm(
        "Are you sure you want to delete this habit? This cannot be undone.",
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
    (l: LogCompletion) => l.status === LogCompletionType.COMPLETED,
  );

  if (loading || !habit) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Loading habit details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Hero Header with Glassmorphism */}
      <div className="relative overflow-hidden bg-white border-b border-gray-200">
        {/* Background Decorative Blobs */}
        <div
          className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: habit.color || "#3b82f6" }}
        />
        <div
          className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full blur-3xl opacity-10 pointer-events-none"
          style={{ backgroundColor: habit.color || "#3b82f6" }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 relative z-10">
          {/* Navigation */}
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors group"
          >
            <div className="p-2 rounded-full bg-white border border-gray-200 group-hover:border-gray-300 shadow-sm transition-all">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="font-medium">Back to Dashboard</span>
          </button>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* Habit Identity */}
            <div className="flex items-center gap-6">
              <div
                className="w-24 h-24 rounded-3xl flex items-center justify-center text-4xl shadow-xl shadow-gray-200 transform transition-transform hover:scale-105 duration-300"
                style={{
                  backgroundColor: habit.color + "20",
                  border: `4px solid ${habit.color}`,
                  color: habit.color,
                }}
              >
                {habit.icon}
              </div>

              <div>
                {isEditing ? (
                  <div className="space-y-4 min-w-[300px] bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-gray-100">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="text-xl font-bold text-gray-900 border-2 border-blue-100 focus:border-blue-500 rounded-xl px-4 py-2 w-full transition-all bg-gray-50 focus:bg-white"
                        placeholder="Habit name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        Description
                      </label>
                      <textarea
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        className="text-sm text-gray-600 border-2 border-blue-100 focus:border-blue-500 rounded-xl px-4 py-2 w-full transition-all bg-gray-50 focus:bg-white resize-none"
                        placeholder="Why do you want to build this habit?"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        Time
                      </label>
                      <div className="flex items-center gap-2 bg-gray-50 border-2 border-blue-100 rounded-xl px-4 py-2 focus-within:border-blue-500 focus-within:bg-white transition-all">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <input
                          type="time"
                          value={editedTime}
                          onChange={(e) => setEditedTime(e.target.value)}
                          className="bg-transparent border-none focus:ring-0 w-full p-0 text-gray-700"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={handleSaveEdit}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
                      >
                        <Save className="w-4 h-4" />
                        Save Changes
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditedName(habit.name);
                          setEditedDescription(habit.description || "");
                          setEditedTime(
                            habit.scheduledTime?.slice(0, 5) || undefined,
                          );
                        }}
                        className="p-2.5 border-2 border-gray-200 rounded-xl hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
                      {habit.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                      <span className="px-3 py-1 bg-gray-100 border border-gray-200 rounded-full font-medium text-gray-700">
                        {habit.category || "General"}
                      </span>
                      {habit.scheduledTime && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-blue-700 font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{habit.scheduledTime?.slice(0, 5)}</span>
                        </div>
                      )}
                      {habit.currentStreak > 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-50 border border-orange-100 rounded-full text-orange-700 font-medium animate-pulse-slow">
                          <Flame className="w-3.5 h-3.5" />
                          <span>{habit.currentStreak} Day Streak</span>
                        </div>
                      )}
                    </div>
                    {habit.description && (
                      <p className="mt-4 text-lg text-gray-500 max-w-2xl leading-relaxed">
                        {habit.description}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Main Action */}
            {!isEditing && (
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto mt-6 md:mt-0">
                {!isCompleted ? (
                  <button
                    onClick={handleComplete}
                    className="w-full sm:w-auto px-8 py-4 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all shadow-xl hover:shadow-2xl shadow-gray-200 transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3 group"
                  >
                    <div className="p-1 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors">
                      <Check className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-lg">Complete Today</span>
                  </button>
                ) : (
                  <div className="w-full sm:w-auto px-8 py-4 bg-green-50 text-green-700 border border-green-200 rounded-2xl flex items-center justify-center gap-3 shadow-sm">
                    <div className="p-1 bg-green-100 rounded-full">
                      <Check className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-lg">Completed!</span>
                  </div>
                )}

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 sm:flex-none py-4 px-4 border border-gray-200 rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all text-gray-600 hover:text-gray-900 flex items-center justify-center gap-2"
                    title="Edit Habit"
                  >
                    <Edit2 className="w-5 h-5" />
                    <span className="sm:hidden font-medium">Edit</span>
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setShowMenu(!showMenu)}
                      className="py-4 px-4 border border-gray-200 rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all text-gray-600 hover:text-gray-900 flex items-center justify-center"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {showMenu && (
                      <>
                        <div
                          className="fixed inset-0 z-20"
                          onClick={() => setShowMenu(false)}
                        />
                        <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 py-2 min-w-[180px] z-30 overflow-hidden text-sm font-medium">
                          <button
                            onClick={() => {
                              handleExport();
                              setShowMenu(false);
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            Export CSV
                          </button>
                          <div className="h-px bg-gray-100 my-1" />
                          <button
                            onClick={() => {
                              handleDelete();
                              setShowMenu(false);
                            }}
                            className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete Habit
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <StatCard
            icon={<Flame className="w-6 h-6 text-orange-500" />}
            label="Current Streak"
            value={habit.currentStreak}
            suffix="days"
            bg="bg-orange-50"
            border="border-orange-100"
          />
          <StatCard
            icon={<Target className="w-6 h-6 text-blue-500" />}
            label="Total Completions"
            value={habit.totalCompletions}
            suffix="times"
            bg="bg-blue-50"
            border="border-blue-100"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6 text-emerald-500" />}
            label="Completion Rate"
            value={80} // Mock calculation for now
            suffix="%"
            bg="bg-emerald-50"
            border="border-emerald-100"
          />
          <StatCard
            icon={<Award className="w-6 h-6 text-purple-500" />}
            label="Best Streak"
            value={habit.longestStreak}
            suffix="days"
            bg="bg-purple-50"
            border="border-purple-100"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Progress & Activity */}
          <div className="lg:col-span-2 space-y-8">
            {/* Goal Progress */}
            <GoalProgress habitId={habitId} />

            {/* Heatmap (Coming Soon/Chart Placeholder) */}
            {/* <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-gray-900">Activity History</h2>
                         <button className="text-sm font-medium text-blue-600 hover:text-blue-700">View All</button>
                    </div>
                     <HabitHeatmap habitId={habitId} />
                     <div className="mt-8 h-64 bg-gray-50 rounded-2xl flex items-center justify-center border border-dashed border-gray-200">
                         <span className="text-gray-400 font-medium">Detailed Analytics Chart Coming Soon</span>
                     </div>
                 </div> */}

            {/* Recent Activity */}
            <RecentActivity habitId={habitId} logs={habit.logs || []} />
          </div>

          {/* Right Column: Insights & Badges? */}
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
              {/* Decorative texture */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl -mr-10 -mt-10" />

              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 relative z-10">
                <TrendingUp className="w-6 h-6" />
                Insights
              </h2>
              <div className="space-y-4 relative z-10">
                <InsightItem text="Best day: Monday (90% completion)" dark />
                <InsightItem text="Most consistent: Week 48 (7/7 days)" dark />
                <InsightItem text="Average per week: 5.2 completions" dark />
                <div className="pt-4 border-t border-white/20">
                  <p className="font-semibold text-lg">
                    &quot;You&apos;re crushing it! Keep it up! 🚀&quot;
                  </p>
                </div>
              </div>
            </div>

            {/* Maybe a 'Notes' section in the future */}
          </div>
        </div>
      </main>
    </div>
  );
}

// Updated Stat Card Component
function StatCard({
  icon,
  label,
  value,
  suffix,
  bg = "bg-gray-50",
  border = "border-gray-100",
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix: string;
  bg?: string;
  border?: string;
}) {
  return (
    <div
      className={`bg-white rounded-3xl p-6 shadow-sm border ${border} hover:shadow-md transition-shadow group`}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`p-3 rounded-2xl ${bg} group-hover:scale-110 transition-transform duration-300`}
        >
          {icon}
        </div>
        {/* Optional: Add a sparkline or mini trend indicator here */}
      </div>
      <div>
        <p className="text-4xl font-extrabold text-gray-900 tracking-tight mb-1">
          {value}
          <span className="text-lg font-medium text-gray-500 ml-1">
            {suffix}
          </span>
        </p>
        <p className="text-sm font-medium text-gray-500">{label}</p>
      </div>
    </div>
  );
}

// Updated Insight Item Component
function InsightItem({ text, dark }: { text: string; dark?: boolean }) {
  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-xl ${dark ? "bg-white/10" : "bg-gray-50"}`}
    >
      <div
        className={`mt-1.5 w-1.5 h-1.5 rounded-full ${dark ? "bg-indigo-300" : "bg-blue-500"}`}
      />
      <p
        className={`text-sm font-medium ${dark ? "text-indigo-50" : "text-gray-700"}`}
      >
        {text}
      </p>
    </div>
  );
}
