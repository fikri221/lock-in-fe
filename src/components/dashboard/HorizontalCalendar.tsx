"use client";

import { useEffect, useRef } from "react";
import { format, subDays, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface HorizontalCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export default function HorizontalCalendar({
  selectedDate,
  onSelectDate,
}: HorizontalCalendarProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Generate dates: 30 days back to 14 days forward
  const dates = Array.from({ length: 45 }, (_, i) => {
    const today = new Date();
    return subDays(today, 30 - i);
  });

  useEffect(() => {
    // Scroll to selected date on mount or when changed
    if (scrollContainerRef.current) {
      const selectedElement = scrollContainerRef.current.querySelector(
        `[data-date="${selectedDate.toISOString().split("T")[0]}"]`
      ) as HTMLElement;

      if (selectedElement) {
        const container = scrollContainerRef.current;
        const scrollLeft =
          selectedElement.offsetLeft -
          container.clientWidth / 2 +
          selectedElement.clientWidth / 2;

        container.scrollTo({
          left: scrollLeft,
          behavior: "smooth",
        });
      }
    }
  }, [selectedDate]);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative group flex items-center">
      {/* Left Navigation Button */}
      <button
        onClick={() => scroll("left")}
        className="hidden md:flex absolute left-0 z-10 -ml-4 h-full w-12 items-center justify-start bg-gradient-to-r from-white via-white/80 to-transparent pr-4 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <div
        ref={scrollContainerRef}
        className="relative flex space-x-2 overflow-x-auto pb-4 pt-2 px-4 scrollbar-hide snap-x touch-pan-x w-full"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {dates.map((date) => {
          const isSelected = isSameDay(date, selectedDate);
          const isToday = isSameDay(date, new Date());

          return (
            <button
              key={date.toISOString()}
              data-date={date.toISOString().split("T")[0]}
              onClick={() => onSelectDate(date)}
              className={cn(
                "flex-shrink-0 flex flex-col items-center justify-center w-14 h-16 rounded-2xl transition-all duration-200 snap-center cursor-pointer",
                isSelected
                  ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg scale-105"
                  : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-100",
                isToday &&
                  !isSelected &&
                  "border-blue-200 bg-blue-50/50 text-blue-600"
              )}
            >
              <span
                className={cn(
                  "text-xs font-medium uppercase mb-1",
                  isSelected ? "text-blue-100" : "text-gray-400",
                  isToday && !isSelected && "text-blue-500"
                )}
              >
                {format(date, "EEE")}
              </span>
              <span
                className={cn(
                  "text-lg font-bold",
                  isSelected ? "text-white" : "text-gray-900",
                  isToday && !isSelected && "text-blue-700"
                )}
              >
                {format(date, "dd")}
              </span>

              {/* Indicator dot for today */}
              {isToday && (
                <div
                  className={cn(
                    "absolute bottom-1.5 w-1 h-1 rounded-full",
                    isSelected ? "bg-white/50" : "bg-blue-500"
                  )}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Right Navigation Button */}
      <button
        onClick={() => scroll("right")}
        className="hidden md:flex absolute right-0 z-10 -mr-4 h-full w-12 items-center justify-end bg-gradient-to-l from-white via-white/80 to-transparent pl-4 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
}
