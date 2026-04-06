"use client";

import { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
  loading?: boolean;
  error?: string;
  className?: string;
}

export default function ChartCard({
  title,
  subtitle,
  children,
  action,
  loading,
  error,
  className = "",
}: ChartCardProps) {
  return (
    <div
      className={`bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-zinc-100 dark:border-zinc-800 ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{title}</h3>
          {subtitle && <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-red-500 dark:text-red-400 text-sm font-medium mb-2">Error</div>
          <div className="text-zinc-600 dark:text-zinc-400 text-sm">{error}</div>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
