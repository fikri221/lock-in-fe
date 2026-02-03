"use client";

import TargetChart from "./TargetChart";
// import ScoreChart from "./ScoreChart";
// import HistoryChart from "./HistoryChart";
import CalendarChart from "./CalendarChart";
// import FrequencyChart from "./FrequencyChart";
import dynamic from "next/dynamic";
const ScoreChart = dynamic(() => import("./ScoreChart"), { ssr: false });

interface HabitChartsProps {
  habitId: string;
}

export default function HabitCharts({ habitId }: HabitChartsProps) {
  return (
    <div className="space-y-6">
      {/* First row: Target and Score */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TargetChart habitId={habitId} />
        <ScoreChart habitId={habitId} />
      </div>

      {/* Second row: History and Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* <HistoryChart habitId={habitId} /> */}
        <CalendarChart habitId={habitId} />
      </div>

      {/* Third row: Frequency (full width) */}
      {/* <FrequencyChart habitId={habitId} /> */}
    </div>
  );
}
