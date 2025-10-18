import { useDroppable } from "@dnd-kit/core";
import React from "react";

interface TimeSlotProps {
  hour: string;
  slotId: string;
  onTimeSlotClick: (hour: string) => void;
  style: React.CSSProperties; // 1. Terima style prop
}

export default React.memo(function TimeSlot({
  hour,
  slotId,
  onTimeSlotClick,
  style,
}: TimeSlotProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `timeslot-${slotId}`,
    data: { hour }, // Kirim data jam
  });

  return (
    <div
      ref={setNodeRef}
      className={`relative h-16 border-t border-b border-l border-gray-200 ${isOver ? 'bg-blue-100' : ''}`}
      onClick={() => onTimeSlotClick(hour)}
    >
      <span className="absolute -top-2 -left-10 text-xs text-gray-500">{hour}</span>
    </div>
  );
});
