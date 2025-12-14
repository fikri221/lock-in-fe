"use client";

import { Skeleton } from "@/components/ui/Skeleton";

export default function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Skeleton */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <div>
                <Skeleton className="h-6 w-24 mb-1" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Skeleton className="hidden sm:block w-32 h-9 rounded-lg" />
              <Skeleton className="w-32 h-10 rounded-lg" />
              <Skeleton className="w-10 h-10 rounded-lg" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Context Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gray-100 rounded-xl">
                  <Skeleton className="w-6 h-6" />
                </div>
                <Skeleton className="w-16 h-6 rounded-full" />
              </div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-3 w-40" />
            </div>
          ))}
        </div>

        {/* Habits Grid Skeleton */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <Skeleton className="h-8 w-40 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-gray-100 h-[200px] flex flex-col justify-between"
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <Skeleton className="w-12 h-12 rounded-xl" />
                    <div>
                      <Skeleton className="h-6 w-32 mb-2" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <Skeleton className="w-8 h-8 rounded-lg" />
                </div>
                <div className="space-y-3">
                  <Skeleton className="w-full h-2 rounded-full" />
                  <div className="flex justify-between">
                    <Skeleton className="w-16 h-4" />
                    <Skeleton className="w-16 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Chart Skeleton */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
          <div className="h-[300px] flex items-end justify-between gap-4 px-4">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <Skeleton
                key={i}
                className="w-full rounded-t-lg"
                style={{ height: `${[45, 72, 30, 85, 55, 60, 40][i - 1]}%` }}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
