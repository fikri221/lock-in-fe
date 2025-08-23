import { useDraggable } from "@dnd-kit/core";
import React from "react";

interface DraggableTaskItemProps {
  task: {
    id: string;
    title: string;
    startHour: number;
    duration: number;
  };
}

export default function DraggableTaskItem({ task }: DraggableTaskItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.5 : 1, // 👈 ini yang adjust opacity
    // Posisi vertikal berdasarkan jam mulai
    top: `${task.startHour * 4}rem`, // 4rem = 64px = h-16
    // Tinggi berdasarkan durasi
    height: `${task.duration * 4}rem`,
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
      className="absolute z-10 flex items-center justify-center p-2 bg-gray-700 text-white rounded-lg shadow cursor-grab"
    >
      <span className="font-bold text-sm">{task.title}</span>
    </div>
  );
}
