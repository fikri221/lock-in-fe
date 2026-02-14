"use client";

import { Skeleton } from "@/components/ui/Skeleton";

export default function DashboardSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/80 px-3 sm:px-4 py-3 sm:py-4 backdrop-blur-lg dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto max-w-lg">
          <div className="flex items-center justify-between mb-1">
            <Skeleton className="h-3 w-20 rounded-md" />
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <Skeleton className="h-6 w-32 rounded-md" />
            <Skeleton className="h-4 w-16 rounded-md" />
          </div>
          {/* Progress bar */}
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
            <Skeleton className="h-full w-1/3 rounded-full" />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 px-3 sm:px-4 py-4 sm:py-6">
        {/* Horizontal Calendar Skeleton */}
        <div className="mb-6 flex justify-between gap-1 overflow-hidden px-1">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <Skeleton className="h-3 w-6 rounded-md" />
              <Skeleton
                className={`h-8 w-8 rounded-full ${
                  i === 4 ? "bg-zinc-300" : ""
                }`}
              />
            </div>
          ))}
        </div>

        {/* Habits List Skeleton */}
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="relative flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4 rounded-md" />
                <Skeleton className="h-3 w-1/2 rounded-md" />
              </div>
              <Skeleton className="h-5 w-5 rounded-full" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
