"use client";

import { ChevronDown } from "lucide-react";
import { ChartPeriod } from "@/types/habits";

interface PeriodFilterProps {
  value: ChartPeriod;
  onChange: (period: ChartPeriod) => void;
}

export default function PeriodFilter({ value, onChange }: PeriodFilterProps) {
  const periods: { value: ChartPeriod; label: string }[] = [
    { value: "day", label: "Day" },
    { value: "month", label: "Month" },
    { value: "year", label: "Year" },
  ];

  return (
    <div className="relative inline-block">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as ChartPeriod)}
        className="appearance-none bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors px-4 py-2 pr-10 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        {periods.map((period) => (
          <option key={period.value} value={period.value} className="dark:bg-zinc-800">
            {period.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
    </div>
  );
}
