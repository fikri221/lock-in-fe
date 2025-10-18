import React from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
// 1. Ubah cara import CSS module
import styles from "./MonthlyCalendarView.module.css";

interface MonthlyCalendarViewProps {
  selectedDate: Date;
  onDateChange: (date: Date | undefined) => void;
}

export default React.memo(function MonthlyCalendarView({
  selectedDate,
  onDateChange,
}: MonthlyCalendarViewProps) {
  return (
    // 2. Terapkan class lokal `styles.container` ke div pembungkus
    <div
      className={`p-4 rounded-lg shadow-md bg-white dark:bg-gray-800 w-fit ${styles.container}`}
    >
      <DayPicker
        mode="single"
        selected={selectedDate}
        onSelect={onDateChange}
        showOutsideDays
        fixedWeeks
      />
    </div>
  );
});
