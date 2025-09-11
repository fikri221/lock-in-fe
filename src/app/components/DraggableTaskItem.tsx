"use client";
import { useDraggable } from "@dnd-kit/core";
import React from "react";

interface DraggableTaskItemProps {
  task: {
    id: string;
    title: string;
    startMinutes: number;
    durationMinutes: number;
  };
  activeDragData: {
    id: string;
    startTime: number;
    endTime: number;
  } | null;
  hourHeightInRem: number; // Tambahkan properti ini
}

export default function DraggableTaskItem({
  task,
  activeDragData,
  hourHeightInRem,
}: DraggableTaskItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
    });

  // Kalkulasi posisi dan tinggi berdasarkan menit
  const topPositionInRem = (task.startMinutes / 60) * hourHeightInRem;
  const heightInRem = (task.durationMinutes / 60) * hourHeightInRem;

  // Format waktu untuk ditampilkan (opsional)
  const formatTime = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}`;
  };

  const startTime = formatTime(
    activeDragData?.id === task.id && activeDragData?.startTime != null
      ? activeDragData.startTime
      : task.startMinutes
  );
  const endTime = formatTime(
    activeDragData?.id === task.id && activeDragData?.endTime != null
      ? activeDragData.endTime
      : task.startMinutes + task.durationMinutes
  );

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.5 : 1, // 👈 ini yang adjust opacity
    // Posisi vertikal berdasarkan jam mulai
    top: `${topPositionInRem}rem`, // 4rem = 64px = h-16
    // Tinggi berdasarkan durasi
    height: `${heightInRem}rem`,
    // Kurangi sedikit width & left agar ada sedikit padding
    width: "calc(100% - 10px)",
    left: "5px",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="absolute z-10 flex flex-col items-start p-2 bg-gray-700 text-white rounded-lg shadow cursor-grab"
    >
      <span className="font-bold text-sm mb-1">{task.title}</span>
      <span className="text-xs opacity-80">
        {startTime} - {endTime}
      </span>
    </div>
  );
}
