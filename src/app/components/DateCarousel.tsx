"use client";

import React, { useMemo, useRef, useState } from "react";

export default function DateCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0); // posisi offset saat drag
  const startX = useRef<number | null>(null);

  const days = useMemo(() => {
    const arr = [];
    const formatterDay = new Intl.DateTimeFormat("id-ID", { weekday: "long" });
    const formatterDate = new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
    });

    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      arr.push({
        day: formatterDay.format(d),
        date: formatterDate.format(d),
      });
    }
    return arr;
  }, []);

  const nextSlide = () => {
    if (currentIndex < days.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // handle drag/swipe
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    startX.current =
      "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (startX.current === null) return;
    const clientX =
      "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const diff = clientX - startX.current;
    setDragOffset(diff);
  };

  const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (startX.current === null) return;
    const endX =
      "changedTouches" in e
        ? e.changedTouches[0].clientX
        : (e as React.MouseEvent).clientX;

    const diff = startX.current - endX;

    if (diff > 50) {
      // geser kiri → next
      nextSlide();
    } else if (diff < -50) {
      // geser kanan → prev
      prevSlide();
    }

    setDragOffset(0);
    startX.current = null;
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Wrapper untuk slider dan tombol */}
      <div className="relative">
        {/* Wrapper */}
        <div
          className="overflow-hidden rounded-lg shadow-inner" // Latar belakang halus + rounded
          onMouseDown={handleTouchStart}
          onMouseMove={handleTouchMove}
          onMouseUp={handleTouchEnd}
          onMouseLeave={handleTouchEnd}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Inner container */}
          <div
            className="flex transition-transform duration-300"
            style={{
              transform: `translateX(calc(-${
                currentIndex * 100
              }% + ${dragOffset}px))`,
              transition: startX.current ? "none" : "transform 0.3s ease",
            }}
          >
            {days.map((d, idx) => (
              <div
                key={idx}
                className="flex-shrink-0 w-full flex flex-col items-center justify-center rounded-lg" // Memberi tinggi & padding konsisten
              >
                {/* Tipografi yang lebih baik */}
                <span className="text-xl font-semibold">
                  {d.day}
                </span>
                <span className="text-sm">{d.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tombol Prev */}
        <button
          onClick={() => setCurrentIndex((i) => Math.max(i - 1, 0))}
          disabled={currentIndex === 0}
          className="absolute top-1/2 left-3 -translate-y-1/2 bg-white/80 text-gray-700 p-2 rounded-full shadow-md hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          aria-label="Previous slide"
        >
          {/* Ikon Chevron Left (Heroicons) */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5 8.25 12l7.5-7.5"
            />
          </svg>
        </button>

        {/* Tombol Next */}
        <button
          onClick={() =>
            setCurrentIndex((i) => Math.min(i + 1, days.length - 1))
          }
          disabled={currentIndex === days.length - 1}
          className="absolute top-1/2 right-3 -translate-y-1/2 bg-white/80 text-gray-700 p-2 rounded-full shadow-md hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          aria-label="Next slide"
        >
          {/* Ikon Chevron Right (Heroicons) */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m8.25 4.5 7.5 7.5-7.5 7.5"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
